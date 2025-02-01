"use client"

import { useState } from "react"
import { BookingTypeSelector } from "./components/booking-type-selector"
import { SecurityDepositSelector } from "./components/security-deposit-selector"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ArrowLeft, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { BookingType, Addon } from "./types"
import { AddonSelector } from "./components/addon-selector"
import { CheckInOutSelector } from "./components/check-in-out-selector"
import { cn } from "@/lib/utils"
import { PAYMENT_CARDS } from "./constants"
import { formatCardNumber, formatExpiryDate, validateCardNumber, validateExpiryDate, getCardType, formatCVC, validateCVC, getCVCLength, getCVCPlaceholder } from "./utils"
import { processPayment } from "./services/merchant-warrior"
import { useToast } from "@/hooks/use-toast"

export default function PaymentFormCreator() {
  // Basic form state
  const [bookingType, setBookingType] = useState<BookingType>("airbnb")
  const [securityDeposit, setSecurityDeposit] = useState("600")
  const [securityDepositOption, setSecurityDepositOption] = useState<"600" | "800" | "1000" | "other">("600")
  const [customSecurityDeposit, setCustomSecurityDeposit] = useState("")
  const [guestName, setGuestName] = useState("")
  const [bookingId, setBookingId] = useState("")
  
  // Additional fees state
  const [accommodationFee, setAccommodationFee] = useState("")
  const [earlyCheckIn, setEarlyCheckIn] = useState("")
  const [lateCheckOut, setLateCheckOut] = useState("")
  
  // Addons state
  const [addons, setAddons] = useState<Addon[]>([
    { name: "Cot", price: 99 },
    { name: "Sofabed", price: 99 },
    { name: "High chair", price: 60 },
    { name: "Pet fee", price: 130 },
  ])
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [newAddonName, setNewAddonName] = useState("")
  const [newAddonPrice, setNewAddonPrice] = useState("")

  // Dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [dialogStep, setDialogStep] = useState<"review" | "payment">("review")

  // New states for card validation
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cardType, setCardType] = useState<string | null>(null)
  const [cvc, setCVC] = useState("")
  const [errors, setErrors] = useState({
    amount: "",
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvc: ""
  })

  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSecurityDepositOptionChange = (value: "600" | "800" | "1000" | "other") => {
    setSecurityDepositOption(value)
    if (value !== "other") {
      setSecurityDeposit(value)
    } else {
      setSecurityDeposit("")
    }
  }

  const handleCustomSecurityDepositChange = (value: string) => {
    setCustomSecurityDeposit(value)
    setSecurityDeposit(value)
  }

  const handleAddonChange = (addonName: string) => {
    setSelectedAddons((prev) => 
      prev.includes(addonName) 
        ? prev.filter((a) => a !== addonName) 
        : [...prev, addonName]
    )
  }

  const handleAddNewAddon = () => {
    if (newAddonName && newAddonPrice) {
      setAddons([...addons, { name: newAddonName, price: Number(newAddonPrice) }])
      setNewAddonName("")
      setNewAddonPrice("")
    }
  }

  const handleRemoveAddon = (addonName: string) => {
    setAddons(addons.filter((addon) => addon.name !== addonName))
    setSelectedAddons(selectedAddons.filter((name) => name !== addonName))
  }

  const calculateTotal = () => {
    let total = 0

    // Add security deposit for OTA and direct bookings
    if (bookingType !== "airbnb") {
      total += Number(securityDeposit) || 0
    }

    // Add accommodation fee for direct bookings only
    if (bookingType === "direct") {
      total += Number(accommodationFee) || 0
    }

    // Add selected addons
    selectedAddons.forEach((addonName) => {
      const addon = addons.find((a) => a.name === addonName)
      if (addon) total += addon.price
    })

    // Add early check-in fee
    if (earlyCheckIn) {
      total += Number(earlyCheckIn) * 60
    }

    // Add late check-out fee
    if (lateCheckOut) {
      total += Number(lateCheckOut) * 60
    }

    return total
  }

  const handleGeneratePaymentLink = () => {
    setShowDialog(true)
    setDialogStep("review")
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
    
    // Clear error when typing
    setErrors(prev => ({ ...prev, cardNumber: "" }))
    
    // Detect card type
    const type = getCardType(formatted)
    setCardType(type)
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    setExpiryDate(formatted)
    
    // Clear error when typing
    setErrors(prev => ({ ...prev, expiryDate: "" }))
  }

  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCVC(e.target.value)
    setCVC(formatted)
    
    // Clear error when typing
    setErrors(prev => ({ ...prev, cvc: "" }))
  }

  const validateAmount = (amount: string) => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) {
      return { isValid: false, message: "Please enter a valid amount" }
    }
    if (numAmount <= 0) {
      return { isValid: false, message: "Amount must be greater than $0" }
    }
    if (numAmount > 99999.99) {
      return { isValid: false, message: "Amount cannot exceed $99,999.99" }
    }
    return { isValid: true, message: "" }
  }

  const validateCardName = (name: string) => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name)
  }

  const validatePaymentForm = () => {
    const newErrors = {
      amount: "",
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvc: ""
    }

    // Amount validation
    const total = calculateTotal()
    const amountValidation = validateAmount(total.toString())
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.message
      toast({
        title: "Invalid Amount",
        description: amountValidation.message,
        variant: "destructive"
      })
      return false
    }

    // Card name validation
    if (!validateCardName(guestName)) {
      newErrors.cardName = "Please enter a valid name (letters and spaces only)"
    }

    // Card number validation
    if (!validateCardNumber(cardNumber)) {
      newErrors.cardNumber = "Invalid card number"
    }

    // Card type validation
    if (!cardType) {
      newErrors.cardNumber = "Unsupported card type"
    }

    // Expiry date validation
    if (!validateExpiryDate(expiryDate)) {
      newErrors.expiryDate = "Invalid expiry date"
    } else {
      // Additional expiry validation
      const [month, year] = expiryDate.split('/')
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1)
      const today = new Date()
      
      if (expiry < today) {
        newErrors.expiryDate = "Card has expired"
      }
    }

    // CVC validation
    if (!validateCVC(cvc, cardType)) {
      newErrors.cvc = `Invalid CVC (${getCVCLength(cardType)} digits required)`
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== "")
  }

  const handlePayment = async () => {
    const total = calculateTotal()
    if (total <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount must be greater than $0",
        variant: "destructive"
      })
      return
    }

    if (!validatePaymentForm()) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await processPayment({
        amount: total.toString(),
        cardNumber,
        cardName: guestName,
        expiryDate,
        cvc,
        customerDetails: {
          name: guestName,
        }
      })

      if (response.success) {
        window.location.href = '/payments/success'
      } else {
        toast({
          title: "Payment Failed",
          description: response.error || "Payment processing failed",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An error occurred processing payment",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-8 flex justify-center">
      <Card className="grid grid-cols-[320px,1fr] overflow-hidden w-[1000px]">
        {/* Left Side - Booking Type */}
        <div className="bg-gradient-to-b from-indigo-50/50 to-white border-r border-border p-8">
          <div className="flex flex-col items-center h-full space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-xl text-indigo-950">Booking Type</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Select the type of booking you want to create
              </p>
            </div>
            <BookingTypeSelector value={bookingType} onChange={setBookingType} />
          </div>
        </div>

        {/* Right Side - Form Fields */}
        <div className="p-8">
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-indigo-950">
                {bookingType === "airbnb" ? "Airbnb" : 
                 bookingType === "ota" ? "OTA Booking" : "Direct Booking"} Details
              </h2>
              <p className="text-muted-foreground">
                Fill in the required information to generate a payment link
              </p>
            </div>

            <div className="space-y-8">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="guest-name" className="text-indigo-950 block text-center">
                    Guest Name
                  </Label>
                  <Input
                    id="guest-name"
                    placeholder="Enter guest's full name"
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value)
                      setErrors(prev => ({ ...prev, cardName: "" }))
                    }}
                    className="h-12"
                  />
                  {errors.cardName && (
                    <p className="text-sm text-red-500 mt-1">{errors.cardName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking-id" className="text-indigo-950 block text-center">
                    Booking ID
                  </Label>
                  <Input
                    id="booking-id"
                    placeholder="Enter booking ID"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {bookingType !== "airbnb" && (
                <div className="space-y-8">
                  <SecurityDepositSelector
                    value={securityDeposit}
                    option={securityDepositOption}
                    onOptionChange={handleSecurityDepositOptionChange}
                    onCustomChange={handleCustomSecurityDepositChange}
                    customValue={customSecurityDeposit}
                  />

                  <AddonSelector
                    addons={addons}
                    selectedAddons={selectedAddons}
                    onAddonChange={handleAddonChange}
                    onAddNewAddon={(name, price) => {
                      setAddons([...addons, { name, price: Number(price) }])
                    }}
                    onRemoveAddon={handleRemoveAddon}
                    showAccommodationFee={bookingType === "direct"}
                    accommodationFee={accommodationFee}
                    onAccommodationFeeChange={setAccommodationFee}
                  />

                  <CheckInOutSelector
                    earlyCheckIn={earlyCheckIn}
                    lateCheckOut={lateCheckOut}
                    onEarlyCheckInChange={setEarlyCheckIn}
                    onLateCheckOutChange={setLateCheckOut}
                  />
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button
                  className="h-12 text-lg px-8 bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleGeneratePaymentLink}
                  disabled={!guestName || !bookingId || (bookingType !== "airbnb" && !securityDeposit) || (bookingType === "direct" && !accommodationFee)}
                >
                  Generate Payment Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-8 py-6 border-b bg-gradient-to-b from-indigo-50/50 to-white">
            <div className="flex items-center space-x-3">
              {dialogStep === "payment" && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setDialogStep("review")}
                  className="h-8 w-8 rounded-full hover:bg-indigo-100"
                >
                  <ArrowLeft className="h-4 w-4 text-indigo-600" />
                </Button>
              )}
              <div>
                <DialogTitle className="text-2xl font-semibold text-indigo-950">
                  {dialogStep === "review" ? "Review Booking Details" : "Complete Payment"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1">
                  {dialogStep === "review"
                    ? "Please review your booking details before proceeding to payment"
                    : "Enter your payment information securely"}
                </DialogDescription>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="absolute right-8 top-8 flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div 
                  className={cn(
                    "h-2 w-12 rounded-full transition-colors duration-300",
                    dialogStep === "review" ? "bg-indigo-600" : "bg-indigo-100"
                  )} 
                />
                <div 
                  className={cn(
                    "h-2 w-12 rounded-full transition-colors duration-300",
                    dialogStep === "payment" ? "bg-indigo-600" : "bg-indigo-100"
                  )} 
                />
              </div>
            </div>
          </DialogHeader>

          <div className="p-8">
            {dialogStep === "review" ? (
              <div className="space-y-6">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-2xl text-indigo-950">Booking Summary</h3>
                      <p className="text-sm text-muted-foreground">Booking ID: {bookingId}</p>
                      <p className="text-sm text-muted-foreground">Guest: {guestName}</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="capitalize bg-indigo-100 text-indigo-700 hover:bg-indigo-100/80"
                    >
                      {bookingType}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {bookingType !== "airbnb" && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-indigo-950">Security Deposit</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-indigo-400" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-indigo-950 text-white">
                                <p>Refundable within 7 days after check-out</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="font-medium text-indigo-950">${securityDeposit}</span>
                      </div>
                    )}

                    {/* Additional fees section */}
                    {(earlyCheckIn || lateCheckOut) && (
                      <>
                        <Separator className="bg-indigo-100" />
                        <div className="space-y-3">
                          <p className="font-medium text-indigo-950">Additional Fees</p>
                          {earlyCheckIn && (
                            <div className="flex justify-between text-sm">
                              <span className="text-indigo-600">Early Check-in ({earlyCheckIn}h)</span>
                              <span className="font-medium">${Number(earlyCheckIn) * 60}</span>
                            </div>
                          )}
                          {lateCheckOut && (
                            <div className="flex justify-between text-sm">
                              <span className="text-indigo-600">Late Check-out ({lateCheckOut}h)</span>
                              <span className="font-medium">${Number(lateCheckOut) * 60}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Selected addons section */}
                    {selectedAddons.length > 0 && (
                      <>
                        <Separator className="bg-indigo-100" />
                        <div className="space-y-3">
                          <p className="font-medium text-indigo-950">Selected Add-ons</p>
                          {selectedAddons.map((addonName) => {
                            const addon = addons.find((a) => a.name === addonName)
                            return (
                              <div key={addonName} className="flex justify-between text-sm">
                                <span className="text-indigo-600">{addonName}</span>
                                <span className="font-medium">${addon?.price}</span>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}

                    <Separator className="bg-indigo-100" />
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold text-lg text-indigo-950">Total Amount</span>
                      <span className="font-semibold text-lg text-indigo-600">${calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg font-medium" 
                  onClick={() => setDialogStep("payment")}
                >
                  Proceed to Payment
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-indigo-950">Payment Information</h3>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {PAYMENT_CARDS.map((card) => (
                      <div
                        key={card.name}
                        className="relative group"
                      >
                        <img 
                          src={card.logo} 
                          alt={card.name}
                          className={cn(
                            "h-8 transition-all duration-200",
                            cardType === card.name.toLowerCase() 
                              ? "grayscale-0 scale-110" 
                              : "grayscale opacity-50 hover:opacity-75 hover:grayscale-0"
                          )}
                        />
                        <div className={cn(
                          "absolute -bottom-6 left-1/2 -translate-x-1/2 transition-all duration-200 text-xs whitespace-nowrap",
                          cardType === card.name.toLowerCase()
                            ? "opacity-100 text-indigo-600 font-medium"
                            : "opacity-0 group-hover:opacity-100 text-muted-foreground"
                        )}>
                          {card.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-name" className="text-indigo-950">Name on Card</Label>
                    <Input 
                      id="card-name" 
                      value={guestName}
                      onChange={(e) => {
                        setGuestName(e.target.value)
                        setErrors(prev => ({ ...prev, cardName: "" }))
                      }}
                      placeholder="Enter name as shown on card" 
                      className={cn(
                        "h-12 border-indigo-100 focus:border-indigo-500 focus:ring-indigo-500/20",
                        errors.cardName && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                    />
                    {errors.cardName && (
                      <p className="text-sm text-red-500 mt-1">{errors.cardName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card-number" className="text-indigo-950">Card Number</Label>
                    <div className="relative">
                      <Input 
                        id="card-number" 
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456" 
                        className={cn(
                          "h-12 pl-12 pr-12 font-mono border-indigo-100 focus:border-indigo-500 focus:ring-indigo-500/20",
                          errors.cardNumber && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        )}
                        maxLength={19}
                      />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 h-5 w-5" />
                      {cardType && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <img 
                            src={`/${cardType}.svg`} 
                            alt={cardType} 
                            className="h-6 w-auto"
                          />
                        </div>
                      )}
                    </div>
                    {errors.cardNumber && (
                      <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-indigo-950">Expiry Date</Label>
                      <Input 
                        id="expiry" 
                        value={expiryDate}
                        onChange={handleExpiryDateChange}
                        placeholder="MM/YY" 
                        className={cn(
                          "h-12 font-mono border-indigo-100 focus:border-indigo-500 focus:ring-indigo-500/20",
                          errors.expiryDate && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        )}
                        maxLength={5}
                      />
                      {errors.expiryDate && (
                        <p className="text-sm text-red-500 mt-1">{errors.expiryDate}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc" className="text-indigo-950">
                        CVC
                        {cardType === 'amex' && (
                          <span className="ml-1 text-sm text-muted-foreground">(4 digits)</span>
                        )}
                      </Label>
                      <div className="relative">
                        <Input 
                          id="cvc" 
                          value={cvc}
                          onChange={handleCVCChange}
                          placeholder={getCVCPlaceholder(cardType)}
                          type="password"
                          className={cn(
                            "h-12 font-mono border-indigo-100 focus:border-indigo-500 focus:ring-indigo-500/20",
                            errors.cvc && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          )}
                          maxLength={getCVCLength(cardType)}
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>The 3 or 4 digit security code on the {cardType === 'amex' ? 'front' : 'back'} of your card</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      {errors.cvc && (
                        <p className="text-sm text-red-500 mt-1">{errors.cvc}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg font-medium"
                  onClick={handlePayment}
                  disabled={isProcessing || calculateTotal() <= 0}
                >
                  {isProcessing ? "Processing..." : calculateTotal() <= 0 ? "No amount to pay" : `Pay $${calculateTotal()}`}
                </Button>

                <div className="flex items-center justify-center space-x-2 text-sm text-indigo-600">
                  <CreditCard className="h-4 w-4" />
                  <p>Your payment information is encrypted and secure</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 