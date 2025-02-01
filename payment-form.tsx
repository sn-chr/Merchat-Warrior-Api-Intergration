"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

export default function PaymentForm() {
  const [bookingType, setBookingType] = useState<"airbnb" | "non-airbnb" | "direct">("airbnb")
  const [addons, setAddons] = useState<string[]>([])

  const handleAddonChange = (addon: string) => {
    setAddons((prev) => (prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Booking Payment Form</CardTitle>
        <CardDescription>Please fill out the payment details for your booking.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Booking Type</Label>
          <RadioGroup
            defaultValue="airbnb"
            onValueChange={(value) => setBookingType(value as "airbnb" | "non-airbnb" | "direct")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="airbnb" id="airbnb" />
              <Label htmlFor="airbnb">Airbnb</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="non-airbnb" id="non-airbnb" />
              <Label htmlFor="non-airbnb">Non-Airbnb (except direct)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="direct" id="direct" />
              <Label htmlFor="direct">Direct Booking</Label>
            </div>
          </RadioGroup>
        </div>

        {bookingType === "airbnb" && (
          <div className="space-y-2">
            <Label htmlFor="pre-arrival">Pre-arrival Information</Label>
            <Textarea id="pre-arrival" placeholder="Please provide any pre-arrival information" />
          </div>
        )}

        {bookingType !== "airbnb" && (
          <div className="space-y-2">
            <Label htmlFor="security-deposit">Security Deposit</Label>
            <Input id="security-deposit" type="number" placeholder="Enter security deposit amount" />
          </div>
        )}

        {bookingType === "direct" && (
          <div className="space-y-2">
            <Label htmlFor="accommodation">Accommodation Payment</Label>
            <Input id="accommodation" type="number" placeholder="Enter accommodation payment amount" />
          </div>
        )}

        {bookingType !== "airbnb" && (
          <div className="space-y-2">
            <Label>Add-ons</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addon1"
                  checked={addons.includes("addon1")}
                  onCheckedChange={() => handleAddonChange("addon1")}
                />
                <Label htmlFor="addon1">Extra Cleaning</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addon2"
                  checked={addons.includes("addon2")}
                  onCheckedChange={() => handleAddonChange("addon2")}
                />
                <Label htmlFor="addon2">Late Check-out</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addon3"
                  checked={addons.includes("addon3")}
                  onCheckedChange={() => handleAddonChange("addon3")}
                />
                <Label htmlFor="addon3">Airport Transfer</Label>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="Enter your full name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="Enter your email address" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Submit Payment</Button>
      </CardFooter>
    </Card>
  )
}

