import { NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "crypto"
import { parseStringPromise } from 'xml2js'

const MW_API_ENDPOINT = process.env.MW_API_ENDPOINT || 'https://base.merchantwarrior.com/post/'
const MW_MERCHANT_UUID = process.env.MW_MERCHANT_UUID || ''
const MW_API_KEY = process.env.MW_API_KEY || ''
const MW_API_PASSPHRASE = process.env.MW_API_PASSPHRASE || ''

// Generate MD5 hash for transaction verification
const generateHash = (params: Record<string, string>) => {
  // Step 1: First generate MD5 of API passphrase
  const passphraseMD5 = crypto
    .createHash('md5')
    .update(MW_API_PASSPHRASE)  // Remove trim() as it's not in docs
    .digest('hex')
    .toLowerCase()

  // Step 2: Concatenate in exact order: md5(apiPassphrase) + merchantUUID + apiKey + transactionAmount + transactionCurrency
  const hashString = passphraseMD5 + 
                    params.merchantUUID + 
                    params.transactionAmount + 
                    params.transactionCurrency

  // Log for verification
  console.log('Hash Generation Steps:', {
    step1_passphraseMD5: passphraseMD5,
    step2_components: {
      md5Passphrase: passphraseMD5,
      merchantUUID: params.merchantUUID,
      amount: params.transactionAmount,
      currency: params.transactionCurrency
    },
    step2_hashString: hashString
  })

  // Step 3: Convert to lowercase
  const lowercaseString = hashString.toLowerCase()

  // Step 4: Generate final MD5
  const finalHash = crypto
    .createHash('md5')
    .update(lowercaseString)
    .digest('hex')
    .toLowerCase()

  
  return finalHash
}

// Parse XML response
const parseResponse = async (response: Response) => {
  const text = await response.text()
  
  try {
    const result = await parseStringPromise(text, { 
      explicitArray: false,
      explicitRoot: true,
      mergeAttrs: true
    })
    
    console.log('Parsed Response:', JSON.stringify(result, null, 2)) // Debug log
    
    // Check different possible response structures
    if (result.mwResponse) {
      return result.mwResponse
    } else if (result.Response) {
      return result.Response
    } else {
      throw new Error('Unexpected response format')
    }
  } catch (error) {
    console.error('XML parsing error:', error)
    throw new Error('Failed to parse response')
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      amount,
      cardNumber,
      cardName,
      expiryDate,
      cvc,
      customerDetails
    } = body

    // Format amount to have exactly 2 decimal places as required by Merchant Warrior
    const formattedAmount = parseFloat(amount).toFixed(2)

    console.log('Amount Formatting:', {
      originalAmount: amount,
      parsedAmount: parseFloat(amount),
      formattedAmount: formattedAmount
    })

    // First get access token
    const tokenResponse = await fetch(MW_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        method: 'getAccessToken',
        merchantUUID: MW_MERCHANT_UUID,
        apiKey: MW_API_KEY,
      })
    })

    const tokenData = await parseResponse(tokenResponse)
    console.log('Token Response:', tokenData) // Debug log
    
    if (!tokenData || !tokenData.responseCode) {
      throw new Error('Invalid token response')
    }
    
    if (tokenData.responseCode !== '0') {
      return NextResponse.json(
        { error: tokenData.responseMessage || 'Token request failed' },
        { status: 400 }
      )
    }

    // Process the payment
    const [expiryMonth, expiryYear] = expiryDate.split('/')
    
    const paymentParams = {
      method: 'processCard',
      merchantUUID: MW_MERCHANT_UUID.trim(),
      apiKey: MW_API_KEY.trim(),
      transactionAmount: formattedAmount,
      transactionCurrency: 'AUD',
      transactionProduct: 'Accommodation Payment',
      customerName: customerDetails.name,
      customerCountry: customerDetails.country || 'AU',
      customerState: customerDetails.state || 'QLD',
      customerCity: customerDetails.city || 'Camberwell',
      customerAddress: customerDetails.address || '3/689 Burke Rd Camberwell',
      customerPostCode: customerDetails.postCode || '4000',
      customerEmail: customerDetails.email || 'jasondaviswb@gmail.com',
      paymentCardNumber: cardNumber.replace(/\s/g, ''),
      paymentCardName: cardName,
      paymentCardExpiry: `${expiryMonth}${expiryYear}`,
      paymentCardCSC: cvc,
    }

    // Add validation before creating payment params
    if (!customerDetails.state) {
      console.warn('Customer state not provided, defaulting to QLD')
    }

    // Generate hash using the exact same values that will be sent
    const hash = generateHash({
      merchantUUID: MW_MERCHANT_UUID,
      transactionAmount: formattedAmount,
      transactionCurrency: 'AUD'
    })

    // Add hash to payment params
    const finalPaymentParams = {
      ...paymentParams,
      hash
    }

    console.log('Final Request Details:', {
      url: MW_API_ENDPOINT,
      params: finalPaymentParams,
      hash: hash
    })

    const paymentResponse = await fetch(MW_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(finalPaymentParams)
    })

    const paymentData = await parseResponse(paymentResponse)
    console.log('Payment Response:', paymentData) // Debug log

    if (!paymentData || !paymentData.responseCode) {
      throw new Error('Invalid payment response')
    }

    if (paymentData.responseCode === '0') {
      // Payment successful
      return NextResponse.json({
        success: true,
        data: {
          transactionID: paymentData.transactionID,
          responseCode: paymentData.responseCode,
          responseMessage: paymentData.responseMessage,
          authCode: paymentData.authCode,
          authMessage: paymentData.authMessage,
          authResponseCode: paymentData.authResponseCode,
          authSettledDate: paymentData.authSettledDate,
          paymentCardNumber: paymentData.paymentCardNumber,
        }
      })
    }

    // Payment failed
    return NextResponse.json(
      { 
        success: false,
        error: paymentData.responseMessage || 'Payment processing failed' 
      },
      { status: 400 }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An error occurred while processing the payment',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 