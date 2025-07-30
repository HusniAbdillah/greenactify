"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/profil/avatar"
import { Button } from "@/components/profil/button"
import { Card, CardContent } from "@/components/profil/card"
import { Badge } from "@/components/profil/badge"
import { Progress } from "@/components/profil/progress"
import { Trophy, Leaf, Users, Target, Star, Menu, Bell, Plus, Home, Map, Award, User } from "lucide-react"

export default function Component() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div className="min-h-screen bg-[#f1fff3] max-w-sm mx-auto relative">
      {/* Header */}
      <div className="bg-[#0c3b2e] text-white p-4 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <Menu className="w-6 h-6" />
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#00d09e]">GreenCity</h1>
          </div>
          <Bell className="w-6 h-6" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12 border-2 border-[#00d09e]">
            <AvatarImage src="/placeholder.svg?height=48&width=48" />
            <AvatarFallback className="bg-[#00d09e] text-[#0c3b2e]">JD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">John Doe</h2>
            <p className="text-[#00d09e] text-sm">Level 5 Eco Warrior</p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-[#ffba00] text-[#0c3b2e] hover:bg-[#de9300]">
              <Trophy className="w-3 h-3 mr-1" />
              1,250
            </Badge>
          </div>
        </div>

        <div className="bg-[#344e41] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Weekly Goal</span>
            <span className="text-[#00d09e] font-semibold">75%</span>
          </div>
          <Progress value={75} className="h-2 bg-[#0c3b2e]" />
          <p className="text-xs text-[#bbe8c3] mt-2">3 more eco-actions to reach your goal!</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-[#00d09e] text-white border-0">
            <CardContent className="p-4 text-center">
              <Leaf className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Plant Tree</h3>
              <p className="text-xs opacity-90">+50 points</p>
            </CardContent>
          </Card>

          <Card className="bg-[#ffba00] text-[#0c3b2e] border-0">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Join Event</h3>
              <p className="text-xs opacity-90">+30 points</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Challenges */}
        <Card className="border-[#bbe8c3]">
          <CardContent className="p-4">
            <h3 className="font-semibold text-[#0c3b2e] mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#00d09e]" />
              Today's Challenges
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#dff7e2] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00d09e] rounded-full flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0c3b2e] text-sm">Use public transport</p>
                    <p className="text-xs text-[#6d9773]">Save 2kg CO₂</p>
                  </div>
                </div>
                <Button size="sm" className="bg-[#00d09e] hover:bg-[#0c3b2e] text-white">
                  +25
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#fff4bc] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ffba00] rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-[#0c3b2e]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0c3b2e] text-sm">Recycle 5 items</p>
                    <p className="text-xs text-[#b46617]">Help the environment</p>
                  </div>
                </div>
                <Button size="sm" className="bg-[#ffba00] hover:bg-[#de9300] text-[#0c3b2e]">
                  +15
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-[#bbe8c3]">
          <CardContent className="p-4">
            <h3 className="font-semibold text-[#0c3b2e] mb-3">Recent Activity</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-[#00d09e] text-white text-xs">SA</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-[#0c3b2e]">
                    <span className="font-medium">Sarah A.</span> planted a tree
                  </p>
                  <p className="text-xs text-[#6d9773]">2 hours ago</p>
                </div>
                <Badge variant="secondary" className="bg-[#dff7e2] text-[#0c3b2e]">
                  +50
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-[#ffba00] text-[#0c3b2e] text-xs">MK</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-[#0c3b2e]">
                    <span className="font-medium">Mike K.</span> completed recycling challenge
                  </p>
                  <p className="text-xs text-[#6d9773]">4 hours ago</p>
                </div>
                <Badge variant="secondary" className="bg-[#fff4bc] text-[#0c3b2e]">
                  +30
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-[#bbe8c3] px-4 py-2">
        <div className="flex justify-around items-center">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 ${activeTab === "home" ? "text-[#00d09e]" : "text-[#6d9773]"}`}
            onClick={() => setActiveTab("home")}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 ${activeTab === "map" ? "text-[#00d09e]" : "text-[#6d9773]"}`}
            onClick={() => setActiveTab("map")}
          >
            <Map className="w-5 h-5" />
            <span className="text-xs">Map</span>
          </Button>

          <Button size="sm" className="bg-[#00d09e] hover:bg-[#0c3b2e] text-white rounded-full w-12 h-12 p-0">
            <Plus className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 ${activeTab === "awards" ? "text-[#00d09e]" : "text-[#6d9773]"}`}
            onClick={() => setActiveTab("awards")}
          >
            <Award className="w-5 h-5" />
            <span className="text-xs">Awards</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 ${activeTab === "profile" ? "text-[#00d09e]" : "text-[#6d9773]"}`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>

      {/* Add some bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  )
}
