"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { PlusCircle, X, CreditCard, ArrowLeft, Info } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

type Addon = {
  name: string
  price: number
}

type BookingType = "airbnb" | "ota" | "direct"

export default function PaymentFormCreator() {
  const [bookingType, setBookingType] = useState<BookingType>("airbnb")
  const [addons, setAddons] = useState<Addon[]>([
    { name: "Cot", price: 99 },
    { name: "Sofabed", price: 99 },
    { name: "High chair", price: 60 },
    { name: "Pet fee", price: 130 },
  ])
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [securityDeposit, setSecurityDeposit] = useState("")
  const [accommodationFee, setAccommodationFee] = useState("")
  const [guestName, setGuestName] = useState("")
  const [bookingId, setBookingId] = useState("")
  const [earlyCheckIn, setEarlyCheckIn] = useState("")
  const [lateCheckOut, setLateCheckOut] = useState("")
  const [newAddonName, setNewAddonName] = useState("")
  const [newAddonPrice, setNewAddonPrice] = useState("")
  const [paymentLinkGenerated, setPaymentLinkGenerated] = useState(false)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [step, setStep] = useState<"review" | "payment">("review")
  const [securityDepositOption, setSecurityDepositOption] = useState<"600" | "800" | "1000" | "other">("600")
  const [customSecurityDeposit, setCustomSecurityDeposit] = useState("")

  const handleAddonChange = (addonName: string) => {
    setSelectedAddons((prev) => (prev.includes(addonName) ? prev.filter((a) => a !== addonName) : [...prev, addonName]))
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
    setShowGuestForm(true)
  }

  const handleSecurityDepositOptionChange = (value: string) => {
    setSecurityDepositOption(value as "600" | "800" | "1000" | "other")
    if (value !== "other") {
      setSecurityDeposit(value)
      setCustomSecurityDeposit("")
    } else {
      setSecurityDeposit("")
    }
  }

  const handleCustomSecurityDepositChange = (value: string) => {
    setCustomSecurityDeposit(value)
    setSecurityDeposit(value)
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Guest Payment Form</CardTitle>
          <CardDescription>Fill out the details to generate a payment link for the guest.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Booking Type</Label>
            <RadioGroup defaultValue="airbnb" onValueChange={(value) => setBookingType(value as BookingType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="airbnb" id="airbnb" />
                <Label htmlFor="airbnb">Airbnb</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ota" id="ota" />
                <Label htmlFor="ota">Booking.com / Expedia / Marriott</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="direct" id="direct" />
                <Label htmlFor="direct">Direct Booking</Label>
              </div>
            </RadioGroup>
          </div>

          {bookingType !== "airbnb" && (
            <div className="space-y-4">
              <Label>Security Deposit</Label>
              <RadioGroup
                value={securityDepositOption}
                onValueChange={handleSecurityDepositOptionChange}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="600"
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-accent"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium">1 Bedroom</div>
                    <div className="text-sm text-muted-foreground">$600</div>
                  </div>
                  <RadioGroupItem value="600" id="600" />
                </Label>
                <Label
                  htmlFor="800"
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-accent"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium">2 Bedrooms</div>
                    <div className="text-sm text-muted-foreground">$800</div>
                  </div>
                  <RadioGroupItem value="800" id="800" />
                </Label>
                <Label
                  htmlFor="1000"
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-accent"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium">3 Bedrooms</div>
                    <div className="text-sm text-muted-foreground">$1000</div>
                  </div>
                  <RadioGroupItem value="1000" id="1000" />
                </Label>
                <Label
                  htmlFor="other"
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-accent"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium">Custom</div>
                    <div className="text-sm text-muted-foreground">Other amount</div>
                  </div>
                  <RadioGroupItem value="other" id="other" />
                </Label>
              </RadioGroup>

              {securityDepositOption === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-security-deposit">Custom Security Deposit Amount</Label>
                  <Input
                    id="custom-security-deposit"
                    type="number"
                    placeholder="Enter custom amount"
                    value={customSecurityDeposit}
                    onChange={(e) => handleCustomSecurityDepositChange(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {bookingType === "direct" && (
            <div className="space-y-2">
              <Label htmlFor="accommodation">Accommodation Fee</Label>
              <Input
                id="accommodation"
                type="number"
                placeholder="Enter accommodation fee amount"
                value={accommodationFee}
                onChange={(e) => setAccommodationFee(e.target.value)}
              />
            </div>
          )}

          {bookingType !== "airbnb" && (
            <div className="space-y-4">
              <Label>Add-ons</Label>
              <div className="space-y-2">
                {addons.map((addon) => (
                  <div key={addon.name} className="flex items-center justify-between border p-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={addon.name}
                        checked={selectedAddons.includes(addon.name)}
                        onCheckedChange={() => handleAddonChange(addon.name)}
                      />
                      <Label htmlFor={addon.name}>
                        {addon.name} (${addon.price})
                      </Label>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveAddon(addon.name)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2 mt-2">
                <Input
                  placeholder="New addon name"
                  value={newAddonName}
                  onChange={(e) => setNewAddonName(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={newAddonPrice}
                  onChange={(e) => setNewAddonPrice(e.target.value)}
                />
                <Button onClick={handleAddNewAddon}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          )}

          {bookingType !== "airbnb" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="early-check-in">Early Check-in (hours)</Label>
                <Input
                  id="early-check-in"
                  type="number"
                  placeholder="Number of hours ($60/hour)"
                  value={earlyCheckIn}
                  onChange={(e) => setEarlyCheckIn(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="late-check-out">Late Check-out (hours)</Label>
                <Input
                  id="late-check-out"
                  type="number"
                  placeholder="Number of hours ($60/hour)"
                  value={lateCheckOut}
                  onChange={(e) => setLateCheckOut(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="guest-name">Guest Name</Label>
            <Input
              id="guest-name"
              placeholder="Enter guest's full name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-id">Booking ID</Label>
            <Input
              id="booking-id"
              placeholder="Enter booking ID"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <Button
            className="w-full"
            onClick={handleGeneratePaymentLink}
            disabled={!guestName || !bookingId || (bookingType !== "airbnb" && !securityDeposit)}
          >
            Generate Payment Link
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showGuestForm} onOpenChange={setShowGuestForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              {step === "payment" && (
                <Button variant="ghost" size="icon" onClick={() => setStep("review")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <DialogTitle>Complete Your Payment</DialogTitle>
                <DialogDescription>
                  {step === "review"
                    ? "Please review your booking details before proceeding to payment"
                    : "Enter your payment information securely"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="relative">
            <div className="absolute top-0 right-0 flex space-x-1">
              <div className={`h-2 w-12 rounded ${step === "review" ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 w-12 rounded ${step === "payment" ? "bg-primary" : "bg-muted"}`} />
            </div>
          </div>

          {step === "review" ? (
            <div className="space-y-6">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-2xl">Booking Details</h3>
                      <p className="text-sm text-muted-foreground">Booking ID: {bookingId}</p>
                      <p className="text-sm text-muted-foreground">Guest: {guestName}</p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {bookingType === "ota" ? "Booking.com/Expedia/Marriott" : bookingType}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {bookingType !== "airbnb" && (
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <span>Security Deposit</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Security deposit will be refunded within 7 days after check-out, subject to our terms
                                  and conditions.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="font-medium">${securityDeposit}</span>
                      </div>
                    )}

                    {bookingType === "direct" && (
                      <div className="flex justify-between items-center">
                        <span>Accommodation Fee</span>
                        <span className="font-medium">${accommodationFee}</span>
                      </div>
                    )}

                    {selectedAddons.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="font-medium">Add-ons</p>
                          {selectedAddons.map((addonName) => {
                            const addon = addons.find((a) => a.name === addonName)
                            return (
                              <div key={addonName} className="flex justify-between text-sm pl-4">
                                <span>{addonName}</span>
                                <span>${addon?.price}</span>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}

                    {(earlyCheckIn || lateCheckOut) && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="font-medium">Check-in/out Options</p>
                          {earlyCheckIn && (
                            <div className="flex justify-between text-sm pl-4">
                              <span>Early Check-in ({earlyCheckIn} hours)</span>
                              <span>${Number(earlyCheckIn) * 60}</span>
                            </div>
                          )}
                          {lateCheckOut && (
                            <div className="flex justify-between text-sm pl-4">
                              <span>Late Check-out ({lateCheckOut} hours)</span>
                              <span>${Number(lateCheckOut) * 60}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <Separator />
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold text-lg">Total Amount</span>
                      <span className="font-semibold text-lg">${calculateTotal()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={() => setStep("payment")}>
                Proceed to Payment
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Payment Information</h3>
                <div className="flex space-x-2">
                  <img src={`${process.env.NEXT_PUBLIC_BASE_URL}/visa.svg`} alt="Visa" className="h-8" />
                  <img src={`${process.env.NEXT_PUBLIC_BASE_URL}/mastercard.svg`} alt="Mastercard" className="h-8" />
                  <img src={`${process.env.NEXT_PUBLIC_BASE_URL}/amex.svg`} alt="American Express" className="h-8" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-name">Name on Card</Label>
                  <Input id="card-name" placeholder="Enter name as shown on card" className="h-12" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <div className="relative">
                    <Input id="card-number" placeholder="1234 5678 9012 3456" className="h-12 pl-12" />
                    <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" className="h-12" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button className="w-full" size="lg">
                  Pay ${calculateTotal()}
                </Button>

                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <p>Your payment information is encrypted and secure</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

