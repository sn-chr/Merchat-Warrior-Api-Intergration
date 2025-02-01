'use client'

import { useRouter } from 'next/navigation'

const onSubmit = async (data: PaymentFormData) => {
  const router = useRouter()
  setIsLoading(true)
  try {
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: data.amount,
        cardNumber: data.cardNumber,
        cardName: data.cardName,
        expiryDate: data.expiryDate,
        cvc: data.cvc,
        customerDetails: data.customerDetails
      }),
    })

    const result = await response.json()

    if (result.success) {
      // Use router for client-side navigation to success page
      router.push('/payments/success')
    } else {
      setError(result.error || 'Payment failed')
    }
  } catch (error) {
    setError('An error occurred while processing payment')
  } finally {
    setIsLoading(false)
  }
} 