// AUTO-GENERATED from the live Supabase project xaepcwnqjwphuwvuekfb.
// Regenerate: supabase gen types typescript --project-id xaepcwnqjwphuwvuekfb > src/database.types.ts
// (or via the Supabase MCP generate_typescript_types). Do not edit by hand.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      Agreement: {
        Row: {
          archived: boolean
          body: string
          createdAt: string
          floorId: string
          id: string
          title: string
          version: number
        }
        Insert: {
          archived?: boolean
          body: string
          createdAt?: string
          floorId: string
          id?: string
          title: string
          version?: number
        }
        Update: {
          archived?: boolean
          body?: string
          createdAt?: string
          floorId?: string
          id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "Agreement_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
        ]
      }
      Automation: {
        Row: {
          action: string
          createdAt: string
          delayHours: number
          enabled: boolean
          floorId: string
          id: string
          name: string | null
          trigger: Database["public"]["Enums"]["AutomationTrigger"]
          updatedAt: string
        }
        Insert: {
          action: string
          createdAt?: string
          delayHours?: number
          enabled?: boolean
          floorId: string
          id?: string
          name?: string | null
          trigger: Database["public"]["Enums"]["AutomationTrigger"]
          updatedAt?: string
        }
        Update: {
          action?: string
          createdAt?: string
          delayHours?: number
          enabled?: boolean
          floorId?: string
          id?: string
          name?: string | null
          trigger?: Database["public"]["Enums"]["AutomationTrigger"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Automation_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
        ]
      }
      AutomationRun: {
        Row: {
          at: string
          automationId: string
          floorId: string
          id: string
          result: string
        }
        Insert: {
          at?: string
          automationId: string
          floorId: string
          id?: string
          result?: string
        }
        Update: {
          at?: string
          automationId?: string
          floorId?: string
          id?: string
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "AutomationRun_automationId_fkey"
            columns: ["automationId"]
            isOneToOne: false
            referencedRelation: "Automation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AutomationRun_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
        ]
      }
      BodyMetric: {
        Row: {
          at: string
          bodyFatPct: number | null
          id: string
          notes: string | null
          restingHr: number | null
          userId: string
          weightLb: number | null
        }
        Insert: {
          at?: string
          bodyFatPct?: number | null
          id?: string
          notes?: string | null
          restingHr?: number | null
          userId: string
          weightLb?: number | null
        }
        Update: {
          at?: string
          bodyFatPct?: number | null
          id?: string
          notes?: string | null
          restingHr?: number | null
          userId?: string
          weightLb?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "BodyMetric_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Booking: {
        Row: {
          classId: string
          createdAt: string
          id: string
          state: Database["public"]["Enums"]["BookingState"]
          updatedAt: string
          userId: string
          waitlistPos: number | null
        }
        Insert: {
          classId: string
          createdAt?: string
          id?: string
          state?: Database["public"]["Enums"]["BookingState"]
          updatedAt?: string
          userId: string
          waitlistPos?: number | null
        }
        Update: {
          classId?: string
          createdAt?: string
          id?: string
          state?: Database["public"]["Enums"]["BookingState"]
          updatedAt?: string
          userId?: string
          waitlistPos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Booking_classId_fkey"
            columns: ["classId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Booking_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Campaign: {
        Row: {
          audience: string
          authorId: string
          body: string
          channel: string
          createdAt: string
          floorId: string | null
          id: string
          sentAt: string | null
          sentCount: number
          status: string
          subject: string
          updatedAt: string
        }
        Insert: {
          audience?: string
          authorId: string
          body: string
          channel?: string
          createdAt?: string
          floorId?: string | null
          id?: string
          sentAt?: string | null
          sentCount?: number
          status?: string
          subject: string
          updatedAt?: string
        }
        Update: {
          audience?: string
          authorId?: string
          body?: string
          channel?: string
          createdAt?: string
          floorId?: string | null
          id?: string
          sentAt?: string | null
          sentCount?: number
          status?: string
          subject?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Campaign_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Campaign_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
        ]
      }
      Challenge: {
        Row: {
          createdAt: string
          endsAt: string
          id: string
          metric: string
          rewardXp: number
          startsAt: string
          title: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          endsAt: string
          id?: string
          metric: string
          rewardXp?: number
          startsAt: string
          title: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          endsAt?: string
          id?: string
          metric?: string
          rewardXp?: number
          startsAt?: string
          title?: string
          updatedAt?: string
        }
        Relationships: []
      }
      ChallengeEntry: {
        Row: {
          challengeId: string
          createdAt: string
          id: string
          progress: number
          updatedAt: string
          userId: string
        }
        Insert: {
          challengeId: string
          createdAt?: string
          id?: string
          progress?: number
          updatedAt?: string
          userId: string
        }
        Update: {
          challengeId?: string
          createdAt?: string
          id?: string
          progress?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ChallengeEntry_challengeId_fkey"
            columns: ["challengeId"]
            isOneToOne: false
            referencedRelation: "Challenge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ChallengeEntry_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Class: {
        Row: {
          capacity: number
          coachId: string
          createdAt: string
          floorId: string
          id: string
          load: Database["public"]["Enums"]["ClassLoad"]
          recurRule: string | null
          startsAt: string
          title: string
          updatedAt: string
        }
        Insert: {
          capacity: number
          coachId: string
          createdAt?: string
          floorId: string
          id?: string
          load?: Database["public"]["Enums"]["ClassLoad"]
          recurRule?: string | null
          startsAt: string
          title: string
          updatedAt?: string
        }
        Update: {
          capacity?: number
          coachId?: string
          createdAt?: string
          floorId?: string
          id?: string
          load?: Database["public"]["Enums"]["ClassLoad"]
          recurRule?: string | null
          startsAt?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Class_coachId_fkey"
            columns: ["coachId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Class_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
        ]
      }
      Comment: {
        Row: {
          authorId: string
          body: string
          createdAt: string
          id: string
          postId: string
        }
        Insert: {
          authorId: string
          body: string
          createdAt?: string
          id?: string
          postId: string
        }
        Update: {
          authorId?: string
          body?: string
          createdAt?: string
          id?: string
          postId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Comment_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Comment_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "Post"
            referencedColumns: ["id"]
          },
        ]
      }
      Conversation: {
        Row: {
          createdAt: string
          id: string
          isGroup: boolean
          title: string | null
        }
        Insert: {
          createdAt?: string
          id?: string
          isGroup?: boolean
          title?: string | null
        }
        Update: {
          createdAt?: string
          id?: string
          isGroup?: boolean
          title?: string | null
        }
        Relationships: []
      }
      ConversationMember: {
        Row: {
          conversationId: string
          id: string
          lastReadAt: string | null
          userId: string
        }
        Insert: {
          conversationId: string
          id?: string
          lastReadAt?: string | null
          userId: string
        }
        Update: {
          conversationId?: string
          id?: string
          lastReadAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ConversationMember_conversationId_fkey"
            columns: ["conversationId"]
            isOneToOne: false
            referencedRelation: "Conversation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ConversationMember_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      CreditLedger: {
        Row: {
          at: string
          balanceAfter: number
          delta: number
          id: string
          note: string | null
          reason: Database["public"]["Enums"]["CreditReason"]
          userId: string
        }
        Insert: {
          at?: string
          balanceAfter: number
          delta: number
          id?: string
          note?: string | null
          reason?: Database["public"]["Enums"]["CreditReason"]
          userId: string
        }
        Update: {
          at?: string
          balanceAfter?: number
          delta?: number
          id?: string
          note?: string | null
          reason?: Database["public"]["Enums"]["CreditReason"]
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "CreditLedger_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      DirectMessage: {
        Row: {
          body: string
          conversationId: string
          createdAt: string
          id: string
          senderId: string
        }
        Insert: {
          body: string
          conversationId: string
          createdAt?: string
          id?: string
          senderId: string
        }
        Update: {
          body?: string
          conversationId?: string
          createdAt?: string
          id?: string
          senderId?: string
        }
        Relationships: [
          {
            foreignKeyName: "DirectMessage_conversationId_fkey"
            columns: ["conversationId"]
            isOneToOne: false
            referencedRelation: "Conversation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "DirectMessage_senderId_fkey"
            columns: ["senderId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Event: {
        Row: {
          art: string | null
          capacity: number | null
          createdAt: string
          floorId: string | null
          hostName: string
          id: string
          isRaid: boolean
          rewardXp: number
          startsAt: string
          title: string
          updatedAt: string
        }
        Insert: {
          art?: string | null
          capacity?: number | null
          createdAt?: string
          floorId?: string | null
          hostName: string
          id?: string
          isRaid?: boolean
          rewardXp?: number
          startsAt: string
          title: string
          updatedAt?: string
        }
        Update: {
          art?: string | null
          capacity?: number | null
          createdAt?: string
          floorId?: string | null
          hostName?: string
          id?: string
          isRaid?: boolean
          rewardXp?: number
          startsAt?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Event_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
        ]
      }
      Exercise: {
        Row: {
          createdAt: string
          cue: string | null
          demoUrl: string | null
          equipment: Database["public"]["Enums"]["Equipment"][]
          id: string
          muscles: Database["public"]["Enums"]["Muscle"][]
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          cue?: string | null
          demoUrl?: string | null
          equipment?: Database["public"]["Enums"]["Equipment"][]
          id?: string
          muscles?: Database["public"]["Enums"]["Muscle"][]
          name: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          cue?: string | null
          demoUrl?: string | null
          equipment?: Database["public"]["Enums"]["Equipment"][]
          id?: string
          muscles?: Database["public"]["Enums"]["Muscle"][]
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      ExerciseEquipment: {
        Row: {
          equipment: Database["public"]["Enums"]["Equipment"]
          exerciseId: string
          id: string
        }
        Insert: {
          equipment: Database["public"]["Enums"]["Equipment"]
          exerciseId: string
          id?: string
        }
        Update: {
          equipment?: Database["public"]["Enums"]["Equipment"]
          exerciseId?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ExerciseEquipment_exerciseId_fkey"
            columns: ["exerciseId"]
            isOneToOne: false
            referencedRelation: "Exercise"
            referencedColumns: ["id"]
          },
        ]
      }
      ExerciseMuscle: {
        Row: {
          exerciseId: string
          id: string
          muscle: Database["public"]["Enums"]["Muscle"]
        }
        Insert: {
          exerciseId: string
          id?: string
          muscle: Database["public"]["Enums"]["Muscle"]
        }
        Update: {
          exerciseId?: string
          id?: string
          muscle?: Database["public"]["Enums"]["Muscle"]
        }
        Relationships: [
          {
            foreignKeyName: "ExerciseMuscle_exerciseId_fkey"
            columns: ["exerciseId"]
            isOneToOne: false
            referencedRelation: "Exercise"
            referencedColumns: ["id"]
          },
        ]
      }
      Floor: {
        Row: {
          address: string | null
          createdAt: string
          geo: Json | null
          hostId: string
          id: string
          name: string
          scenery: Database["public"]["Enums"]["Scenery"]
          stripeAccountId: string | null
          updatedAt: string
        }
        Insert: {
          address?: string | null
          createdAt?: string
          geo?: Json | null
          hostId: string
          id?: string
          name: string
          scenery: Database["public"]["Enums"]["Scenery"]
          stripeAccountId?: string | null
          updatedAt?: string
        }
        Update: {
          address?: string | null
          createdAt?: string
          geo?: Json | null
          hostId?: string
          id?: string
          name?: string
          scenery?: Database["public"]["Enums"]["Scenery"]
          stripeAccountId?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Floor_hostId_fkey"
            columns: ["hostId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      FloorEquipment: {
        Row: {
          count: number
          createdAt: string
          equipment: Database["public"]["Enums"]["Equipment"]
          floorId: string
          id: string
          updatedAt: string
        }
        Insert: {
          count?: number
          createdAt?: string
          equipment: Database["public"]["Enums"]["Equipment"]
          floorId: string
          id?: string
          updatedAt?: string
        }
        Update: {
          count?: number
          createdAt?: string
          equipment?: Database["public"]["Enums"]["Equipment"]
          floorId?: string
          id?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "FloorEquipment_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
        ]
      }
      Follow: {
        Row: {
          createdAt: string
          followeeId: string
          followerId: string
          id: string
        }
        Insert: {
          createdAt?: string
          followeeId: string
          followerId: string
          id?: string
        }
        Update: {
          createdAt?: string
          followeeId?: string
          followerId?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Follow_followeeId_fkey"
            columns: ["followeeId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Follow_followerId_fkey"
            columns: ["followerId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      GiftCard: {
        Row: {
          balanceCents: number
          code: string
          createdAt: string
          id: string
          initialCents: number
          purchaserId: string | null
          recipientEmail: string | null
          redeemedById: string | null
        }
        Insert: {
          balanceCents: number
          code: string
          createdAt?: string
          id?: string
          initialCents: number
          purchaserId?: string | null
          recipientEmail?: string | null
          redeemedById?: string | null
        }
        Update: {
          balanceCents?: number
          code?: string
          createdAt?: string
          id?: string
          initialCents?: number
          purchaserId?: string | null
          recipientEmail?: string | null
          redeemedById?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "GiftCard_purchaserId_fkey"
            columns: ["purchaserId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "GiftCard_redeemedById_fkey"
            columns: ["redeemedById"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      GuestPass: {
        Row: {
          code: string
          createdAt: string
          expiresAt: string | null
          guestName: string | null
          id: string
          usedAt: string | null
          userId: string
        }
        Insert: {
          code: string
          createdAt?: string
          expiresAt?: string | null
          guestName?: string | null
          id?: string
          usedAt?: string | null
          userId: string
        }
        Update: {
          code?: string
          createdAt?: string
          expiresAt?: string | null
          guestName?: string | null
          id?: string
          usedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "GuestPass_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      HealthConnection: {
        Row: {
          connectedAt: string
          id: string
          provider: Database["public"]["Enums"]["HealthProvider"]
          status: string
          userId: string
        }
        Insert: {
          connectedAt?: string
          id?: string
          provider: Database["public"]["Enums"]["HealthProvider"]
          status?: string
          userId: string
        }
        Update: {
          connectedAt?: string
          id?: string
          provider?: Database["public"]["Enums"]["HealthProvider"]
          status?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "HealthConnection_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Herd: {
        Row: {
          createdAt: string
          id: string
          postId: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id?: string
          postId: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          postId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Herd_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "Post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Herd_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Lead: {
        Row: {
          contact: string
          createdAt: string
          floorId: string
          id: string
          name: string
          notes: string | null
          source: string
          stage: Database["public"]["Enums"]["LeadStage"]
          updatedAt: string
          valueCents: number
        }
        Insert: {
          contact: string
          createdAt?: string
          floorId: string
          id?: string
          name: string
          notes?: string | null
          source?: string
          stage?: Database["public"]["Enums"]["LeadStage"]
          updatedAt?: string
          valueCents?: number
        }
        Update: {
          contact?: string
          createdAt?: string
          floorId?: string
          id?: string
          name?: string
          notes?: string | null
          source?: string
          stage?: Database["public"]["Enums"]["LeadStage"]
          updatedAt?: string
          valueCents?: number
        }
        Relationships: [
          {
            foreignKeyName: "Lead_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
        ]
      }
      LeadActivity: {
        Row: {
          at: string
          floorId: string
          id: string
          kind: string
          leadId: string
          note: string
        }
        Insert: {
          at?: string
          floorId: string
          id?: string
          kind: string
          leadId: string
          note?: string
        }
        Update: {
          at?: string
          floorId?: string
          id?: string
          kind?: string
          leadId?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "LeadActivity_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "LeadActivity_leadId_fkey"
            columns: ["leadId"]
            isOneToOne: false
            referencedRelation: "Lead"
            referencedColumns: ["id"]
          },
        ]
      }
      Membership: {
        Row: {
          addOns: string[]
          createdAt: string
          floorId: string
          id: string
          renewsAt: string | null
          status: Database["public"]["Enums"]["MembershipStatus"]
          stripeSubId: string | null
          tier: Database["public"]["Enums"]["Tier"]
          updatedAt: string
          userId: string
        }
        Insert: {
          addOns?: string[]
          createdAt?: string
          floorId: string
          id?: string
          renewsAt?: string | null
          status?: Database["public"]["Enums"]["MembershipStatus"]
          stripeSubId?: string | null
          tier: Database["public"]["Enums"]["Tier"]
          updatedAt?: string
          userId: string
        }
        Update: {
          addOns?: string[]
          createdAt?: string
          floorId?: string
          id?: string
          renewsAt?: string | null
          status?: Database["public"]["Enums"]["MembershipStatus"]
          stripeSubId?: string | null
          tier?: Database["public"]["Enums"]["Tier"]
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Membership_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Membership_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      MembershipAddOn: {
        Row: {
          addOn: string
          createdAt: string
          id: string
          membershipId: string
        }
        Insert: {
          addOn: string
          createdAt?: string
          id?: string
          membershipId: string
        }
        Update: {
          addOn?: string
          createdAt?: string
          id?: string
          membershipId?: string
        }
        Relationships: [
          {
            foreignKeyName: "MembershipAddOn_membershipId_fkey"
            columns: ["membershipId"]
            isOneToOne: false
            referencedRelation: "Membership"
            referencedColumns: ["id"]
          },
        ]
      }
      Message: {
        Row: {
          authorId: string
          authorName: string
          authorRole: string
          body: string
          createdAt: string
          floorId: string | null
          id: string
          memberId: string
        }
        Insert: {
          authorId: string
          authorName: string
          authorRole: string
          body: string
          createdAt?: string
          floorId?: string | null
          id?: string
          memberId: string
        }
        Update: {
          authorId?: string
          authorName?: string
          authorRole?: string
          body?: string
          createdAt?: string
          floorId?: string | null
          id?: string
          memberId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Message_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Message_memberId_fkey"
            columns: ["memberId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Notification: {
        Row: {
          body: string
          createdAt: string
          href: string | null
          id: string
          kind: Database["public"]["Enums"]["NotificationKind"]
          read: boolean
          title: string
          userId: string
        }
        Insert: {
          body?: string
          createdAt?: string
          href?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["NotificationKind"]
          read?: boolean
          title: string
          userId: string
        }
        Update: {
          body?: string
          createdAt?: string
          href?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["NotificationKind"]
          read?: boolean
          title?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Notification_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      OnboardingState: {
        Row: {
          completed: boolean
          data: Json
          step: number
          updatedAt: string
          userId: string
        }
        Insert: {
          completed?: boolean
          data?: Json
          step?: number
          updatedAt?: string
          userId: string
        }
        Update: {
          completed?: boolean
          data?: Json
          step?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "OnboardingState_userId_fkey"
            columns: ["userId"]
            isOneToOne: true
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Order: {
        Row: {
          createdAt: string
          id: string
          placedAt: string | null
          state: Database["public"]["Enums"]["OrderState"]
          stripePiId: string | null
          totalCents: number
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id?: string
          placedAt?: string | null
          state?: Database["public"]["Enums"]["OrderState"]
          stripePiId?: string | null
          totalCents?: number
          updatedAt?: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          placedAt?: string | null
          state?: Database["public"]["Enums"]["OrderState"]
          stripePiId?: string | null
          totalCents?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Order_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      OrderItem: {
        Row: {
          createdAt: string
          id: string
          orderId: string
          priceCents: number
          productId: string
          qty: number
          size: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id?: string
          orderId: string
          priceCents: number
          productId: string
          qty: number
          size: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: string
          orderId?: string
          priceCents?: number
          productId?: string
          qty?: number
          size?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "OrderItem_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "Order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "OrderItem_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      Pack: {
        Row: {
          active: boolean
          createdAt: string
          credits: number
          floorId: string | null
          id: string
          name: string
          priceCents: number
        }
        Insert: {
          active?: boolean
          createdAt?: string
          credits: number
          floorId?: string | null
          id?: string
          name: string
          priceCents: number
        }
        Update: {
          active?: boolean
          createdAt?: string
          credits?: number
          floorId?: string | null
          id?: string
          name?: string
          priceCents?: number
        }
        Relationships: [
          {
            foreignKeyName: "Pack_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
        ]
      }
      Pairing: {
        Row: {
          authorId: string
          createdAt: string
          goal: string
          id: string
          name: string
          published: boolean
          service: string
          tier: string
          updatedAt: string
        }
        Insert: {
          authorId: string
          createdAt?: string
          goal?: string
          id: string
          name: string
          published?: boolean
          service?: string
          tier?: string
          updatedAt?: string
        }
        Update: {
          authorId?: string
          createdAt?: string
          goal?: string
          id?: string
          name?: string
          published?: boolean
          service?: string
          tier?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Pairing_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      PairingItem: {
        Row: {
          createdAt: string
          detail: string
          id: string
          index: number
          name: string
          pairingId: string
          trackId: string | null
        }
        Insert: {
          createdAt?: string
          detail?: string
          id: string
          index?: number
          name: string
          pairingId: string
          trackId?: string | null
        }
        Update: {
          createdAt?: string
          detail?: string
          id?: string
          index?: number
          name?: string
          pairingId?: string
          trackId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "PairingItem_pairingId_fkey"
            columns: ["pairingId"]
            isOneToOne: false
            referencedRelation: "Pairing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PairingItem_trackId_fkey"
            columns: ["trackId"]
            isOneToOne: false
            referencedRelation: "Track"
            referencedColumns: ["id"]
          },
        ]
      }
      PairingUpvote: {
        Row: {
          createdAt: string
          id: string
          pairingId: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id?: string
          pairingId: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          pairingId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "PairingUpvote_pairingId_fkey"
            columns: ["pairingId"]
            isOneToOne: false
            referencedRelation: "Pairing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PairingUpvote_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Payment: {
        Row: {
          amountCents: number
          at: string
          createdAt: string
          floorId: string
          id: string
          kind: string
          state: Database["public"]["Enums"]["PayState"]
          stripePiId: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          amountCents: number
          at?: string
          createdAt?: string
          floorId: string
          id?: string
          kind: string
          state?: Database["public"]["Enums"]["PayState"]
          stripePiId?: string | null
          updatedAt?: string
          userId: string
        }
        Update: {
          amountCents?: number
          at?: string
          createdAt?: string
          floorId?: string
          id?: string
          kind?: string
          state?: Database["public"]["Enums"]["PayState"]
          stripePiId?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Payment_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Payment_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Post: {
        Row: {
          body: string
          createdAt: string
          id: string
          mediaUrl: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          body: string
          createdAt?: string
          id?: string
          mediaUrl?: string | null
          updatedAt?: string
          userId: string
        }
        Update: {
          body?: string
          createdAt?: string
          id?: string
          mediaUrl?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Post_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      PR: {
        Row: {
          at: string
          createdAt: string
          id: string
          lift: string
          unit: string
          updatedAt: string
          userId: string
          value: number
        }
        Insert: {
          at?: string
          createdAt?: string
          id?: string
          lift: string
          unit?: string
          updatedAt?: string
          userId: string
          value: number
        }
        Update: {
          at?: string
          createdAt?: string
          id?: string
          lift?: string
          unit?: string
          updatedAt?: string
          userId?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "PR_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Product: {
        Row: {
          collection: string
          colors: string[]
          createdAt: string
          gateLevel: number
          id: string
          imageUrl: string | null
          name: string
          priceCents: number
          sizes: string[]
          updatedAt: string
        }
        Insert: {
          collection: string
          colors?: string[]
          createdAt?: string
          gateLevel?: number
          id?: string
          imageUrl?: string | null
          name: string
          priceCents: number
          sizes?: string[]
          updatedAt?: string
        }
        Update: {
          collection?: string
          colors?: string[]
          createdAt?: string
          gateLevel?: number
          id?: string
          imageUrl?: string | null
          name?: string
          priceCents?: number
          sizes?: string[]
          updatedAt?: string
        }
        Relationships: []
      }
      ProductColor: {
        Row: {
          color: string
          id: string
          index: number
          productId: string
        }
        Insert: {
          color: string
          id?: string
          index?: number
          productId: string
        }
        Update: {
          color?: string
          id?: string
          index?: number
          productId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ProductColor_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      ProductReview: {
        Row: {
          body: string
          createdAt: string
          id: string
          productId: string
          rating: number
          title: string | null
          userId: string
        }
        Insert: {
          body?: string
          createdAt?: string
          id?: string
          productId: string
          rating: number
          title?: string | null
          userId: string
        }
        Update: {
          body?: string
          createdAt?: string
          id?: string
          productId?: string
          rating?: number
          title?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ProductReview_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ProductReview_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ProductSize: {
        Row: {
          id: string
          index: number
          productId: string
          size: string
        }
        Insert: {
          id?: string
          index?: number
          productId: string
          size: string
        }
        Update: {
          id?: string
          index?: number
          productId?: string
          size?: string
        }
        Relationships: [
          {
            foreignKeyName: "ProductSize_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      Profile: {
        Row: {
          avatarUrl: string | null
          bio: string | null
          handle: string | null
          homeFloorId: string | null
          id: string
          initial: string
          level: number
          name: string
          role: Database["public"]["Enums"]["Role"]
          updatedAt: string
          xp: number
        }
        Insert: {
          avatarUrl?: string | null
          bio?: string | null
          handle?: string | null
          homeFloorId?: string | null
          id: string
          initial: string
          level?: number
          name: string
          role?: Database["public"]["Enums"]["Role"]
          updatedAt?: string
          xp?: number
        }
        Update: {
          avatarUrl?: string | null
          bio?: string | null
          handle?: string | null
          homeFloorId?: string | null
          id?: string
          initial?: string
          level?: number
          name?: string
          role?: Database["public"]["Enums"]["Role"]
          updatedAt?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "Profile_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Program: {
        Row: {
          coachId: string
          createdAt: string
          id: string
          notes: string | null
          title: string
          updatedAt: string
          userId: string
        }
        Insert: {
          coachId: string
          createdAt?: string
          id?: string
          notes?: string | null
          title: string
          updatedAt?: string
          userId: string
        }
        Update: {
          coachId?: string
          createdAt?: string
          id?: string
          notes?: string | null
          title?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Program_coachId_fkey"
            columns: ["coachId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Program_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ProgramItem: {
        Row: {
          createdAt: string
          exerciseId: string
          id: string
          index: number
          programId: string
          sets: number
          targetReps: number | null
          targetWeight: number | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          exerciseId: string
          id?: string
          index?: number
          programId: string
          sets?: number
          targetReps?: number | null
          targetWeight?: number | null
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          exerciseId?: string
          id?: string
          index?: number
          programId?: string
          sets?: number
          targetReps?: number | null
          targetWeight?: number | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ProgramItem_exerciseId_fkey"
            columns: ["exerciseId"]
            isOneToOne: false
            referencedRelation: "Exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ProgramItem_programId_fkey"
            columns: ["programId"]
            isOneToOne: false
            referencedRelation: "Program"
            referencedColumns: ["id"]
          },
        ]
      }
      PromoCode: {
        Row: {
          active: boolean
          code: string
          createdAt: string
          expiresAt: string | null
          id: string
          kind: Database["public"]["Enums"]["DiscountKind"]
          maxRedemptions: number | null
          timesRedeemed: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          createdAt?: string
          expiresAt?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["DiscountKind"]
          maxRedemptions?: number | null
          timesRedeemed?: number
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          createdAt?: string
          expiresAt?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["DiscountKind"]
          maxRedemptions?: number | null
          timesRedeemed?: number
          value?: number
        }
        Relationships: []
      }
      Quest: {
        Row: {
          createdAt: string
          current: number
          id: string
          name: string
          state: string
          target: number
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          current?: number
          id?: string
          name: string
          state?: string
          target: number
          updatedAt?: string
          userId: string
        }
        Update: {
          createdAt?: string
          current?: number
          id?: string
          name?: string
          state?: string
          target?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Quest_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Recovery: {
        Row: {
          muscle: Database["public"]["Enums"]["Muscle"]
          state: string
          updatedAt: string
          userId: string
        }
        Insert: {
          muscle: Database["public"]["Enums"]["Muscle"]
          state: string
          updatedAt?: string
          userId: string
        }
        Update: {
          muscle?: Database["public"]["Enums"]["Muscle"]
          state?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Recovery_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      SetLog: {
        Row: {
          createdAt: string
          done: boolean
          exerciseId: string
          id: string
          index: number
          reps: number
          rpe: number | null
          sessionId: string
          updatedAt: string
          weight: number | null
        }
        Insert: {
          createdAt?: string
          done?: boolean
          exerciseId: string
          id?: string
          index: number
          reps: number
          rpe?: number | null
          sessionId: string
          updatedAt?: string
          weight?: number | null
        }
        Update: {
          createdAt?: string
          done?: boolean
          exerciseId?: string
          id?: string
          index?: number
          reps?: number
          rpe?: number | null
          sessionId?: string
          updatedAt?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "SetLog_exerciseId_fkey"
            columns: ["exerciseId"]
            isOneToOne: false
            referencedRelation: "Exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "SetLog_sessionId_fkey"
            columns: ["sessionId"]
            isOneToOne: false
            referencedRelation: "WorkoutSession"
            referencedColumns: ["id"]
          },
        ]
      }
      Shift: {
        Row: {
          coverRequested: boolean
          createdAt: string
          endsAt: string
          floorId: string
          id: string
          kind: Database["public"]["Enums"]["ShiftKind"]
          staffId: string
          startsAt: string
        }
        Insert: {
          coverRequested?: boolean
          createdAt?: string
          endsAt: string
          floorId: string
          id?: string
          kind?: Database["public"]["Enums"]["ShiftKind"]
          staffId: string
          startsAt: string
        }
        Update: {
          coverRequested?: boolean
          createdAt?: string
          endsAt?: string
          floorId?: string
          id?: string
          kind?: Database["public"]["Enums"]["ShiftKind"]
          staffId?: string
          startsAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Shift_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Shift_staffId_fkey"
            columns: ["staffId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ShippingAddress: {
        Row: {
          city: string
          country: string
          createdAt: string
          id: string
          isDefault: boolean
          line1: string
          line2: string | null
          name: string
          phone: string | null
          postal: string
          region: string
          userId: string
        }
        Insert: {
          city: string
          country?: string
          createdAt?: string
          id?: string
          isDefault?: boolean
          line1: string
          line2?: string | null
          name: string
          phone?: string | null
          postal: string
          region: string
          userId: string
        }
        Update: {
          city?: string
          country?: string
          createdAt?: string
          id?: string
          isDefault?: boolean
          line1?: string
          line2?: string | null
          name?: string
          phone?: string | null
          postal?: string
          region?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ShippingAddress_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Signature: {
        Row: {
          agreementId: string
          dataUrl: string
          floorId: string
          id: string
          signedAt: string
          userId: string
        }
        Insert: {
          agreementId: string
          dataUrl: string
          floorId: string
          id?: string
          signedAt?: string
          userId: string
        }
        Update: {
          agreementId?: string
          dataUrl?: string
          floorId?: string
          id?: string
          signedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Signature_agreementId_fkey"
            columns: ["agreementId"]
            isOneToOne: false
            referencedRelation: "Agreement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Signature_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Signature_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Species: {
        Row: {
          createdAt: string
          glyph: string
          id: string
          lore: string
          name: string
          region: string
          tier: string
          zone: number
        }
        Insert: {
          createdAt?: string
          glyph: string
          id: string
          lore?: string
          name: string
          region: string
          tier: string
          zone?: number
        }
        Update: {
          createdAt?: string
          glyph?: string
          id?: string
          lore?: string
          name?: string
          region?: string
          tier?: string
          zone?: number
        }
        Relationships: []
      }
      Ticket: {
        Row: {
          checkedInAt: string | null
          createdAt: string
          eventId: string
          id: string
          qrCode: string
          state: Database["public"]["Enums"]["TicketState"]
          tierId: string
          updatedAt: string
          userId: string
        }
        Insert: {
          checkedInAt?: string | null
          createdAt?: string
          eventId: string
          id?: string
          qrCode: string
          state?: Database["public"]["Enums"]["TicketState"]
          tierId: string
          updatedAt?: string
          userId: string
        }
        Update: {
          checkedInAt?: string | null
          createdAt?: string
          eventId?: string
          id?: string
          qrCode?: string
          state?: Database["public"]["Enums"]["TicketState"]
          tierId?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Ticket_eventId_fkey"
            columns: ["eventId"]
            isOneToOne: false
            referencedRelation: "Event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Ticket_tierId_fkey"
            columns: ["tierId"]
            isOneToOne: false
            referencedRelation: "TicketTier"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Ticket_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      TicketTier: {
        Row: {
          createdAt: string
          eventId: string
          id: string
          name: string
          priceCents: number
          qty: number
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          eventId: string
          id?: string
          name: string
          priceCents: number
          qty: number
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          eventId?: string
          id?: string
          name?: string
          priceCents?: number
          qty?: number
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "TicketTier_eventId_fkey"
            columns: ["eventId"]
            isOneToOne: false
            referencedRelation: "Event"
            referencedColumns: ["id"]
          },
        ]
      }
      Track: {
        Row: {
          art: string
          artist: string
          bpm: number
          createdAt: string
          dur: string
          energy: number
          id: string
          title: string
        }
        Insert: {
          art?: string
          artist: string
          bpm: number
          createdAt?: string
          dur: string
          energy?: number
          id: string
          title: string
        }
        Update: {
          art?: string
          artist?: string
          bpm?: number
          createdAt?: string
          dur?: string
          energy?: number
          id?: string
          title?: string
        }
        Relationships: []
      }
      Tribe: {
        Row: {
          createdAt: string
          description: string | null
          foundedAt: string
          hostId: string | null
          id: string
          memberIds: string[]
          name: string
          scenery: Database["public"]["Enums"]["Scenery"] | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          foundedAt?: string
          hostId?: string | null
          id?: string
          memberIds?: string[]
          name: string
          scenery?: Database["public"]["Enums"]["Scenery"] | null
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          foundedAt?: string
          hostId?: string | null
          id?: string
          memberIds?: string[]
          name?: string
          scenery?: Database["public"]["Enums"]["Scenery"] | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Tribe_hostId_fkey"
            columns: ["hostId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      TribeMember: {
        Row: {
          id: string
          joinedAt: string
          role: string
          tribeId: string
          userId: string
        }
        Insert: {
          id?: string
          joinedAt?: string
          role?: string
          tribeId: string
          userId: string
        }
        Update: {
          id?: string
          joinedAt?: string
          role?: string
          tribeId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "TribeMember_tribeId_fkey"
            columns: ["tribeId"]
            isOneToOne: false
            referencedRelation: "Tribe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TribeMember_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          authUserId: string | null
          bio: string | null
          coachId: string | null
          createdAt: string
          email: string
          floorId: string | null
          handle: string | null
          homeFloorId: string | null
          id: string
          initial: string
          level: number
          name: string
          role: Database["public"]["Enums"]["Role"]
          updatedAt: string
          xp: number
        }
        Insert: {
          authUserId?: string | null
          bio?: string | null
          coachId?: string | null
          createdAt?: string
          email: string
          floorId?: string | null
          handle?: string | null
          homeFloorId?: string | null
          id?: string
          initial: string
          level?: number
          name: string
          role?: Database["public"]["Enums"]["Role"]
          updatedAt?: string
          xp?: number
        }
        Update: {
          authUserId?: string | null
          bio?: string | null
          coachId?: string | null
          createdAt?: string
          email?: string
          floorId?: string | null
          handle?: string | null
          homeFloorId?: string | null
          id?: string
          initial?: string
          level?: number
          name?: string
          role?: Database["public"]["Enums"]["Role"]
          updatedAt?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "User_coachId_fkey"
            columns: ["coachId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "User_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "User_homeFloorId_fkey"
            columns: ["homeFloorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
        ]
      }
      UserPack: {
        Row: {
          creditsRemaining: number
          expiresAt: string | null
          id: string
          packId: string
          purchasedAt: string
          userId: string
        }
        Insert: {
          creditsRemaining: number
          expiresAt?: string | null
          id?: string
          packId: string
          purchasedAt?: string
          userId: string
        }
        Update: {
          creditsRemaining?: number
          expiresAt?: string | null
          id?: string
          packId?: string
          purchasedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserPack_packId_fkey"
            columns: ["packId"]
            isOneToOne: false
            referencedRelation: "Pack"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserPack_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      UserSpecies: {
        Row: {
          caughtAt: string
          id: string
          speciesId: string
          userId: string
        }
        Insert: {
          caughtAt?: string
          id?: string
          speciesId: string
          userId: string
        }
        Update: {
          caughtAt?: string
          id?: string
          speciesId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserSpecies_speciesId_fkey"
            columns: ["speciesId"]
            isOneToOne: false
            referencedRelation: "Species"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserSpecies_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Waiver: {
        Row: {
          body: string
          createdAt: string
          floorId: string | null
          id: string
          title: string
          version: number
        }
        Insert: {
          body: string
          createdAt?: string
          floorId?: string | null
          id?: string
          title: string
          version?: number
        }
        Update: {
          body?: string
          createdAt?: string
          floorId?: string | null
          id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "Waiver_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
        ]
      }
      WaiverSignature: {
        Row: {
          id: string
          signedAt: string
          userId: string
          waiverId: string
        }
        Insert: {
          id?: string
          signedAt?: string
          userId: string
          waiverId: string
        }
        Update: {
          id?: string
          signedAt?: string
          userId?: string
          waiverId?: string
        }
        Relationships: [
          {
            foreignKeyName: "WaiverSignature_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "WaiverSignature_waiverId_fkey"
            columns: ["waiverId"]
            isOneToOne: false
            referencedRelation: "Waiver"
            referencedColumns: ["id"]
          },
        ]
      }
      WebhookEvent: {
        Row: {
          id: string
          processedAt: string | null
          receivedAt: string
          type: string
        }
        Insert: {
          id: string
          processedAt?: string | null
          receivedAt?: string
          type: string
        }
        Update: {
          id?: string
          processedAt?: string | null
          receivedAt?: string
          type?: string
        }
        Relationships: []
      }
      WishlistItem: {
        Row: {
          createdAt: string
          id: string
          productId: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id?: string
          productId: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          productId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "WishlistItem_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "WishlistItem_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      WorkoutSession: {
        Row: {
          createdAt: string
          endedAt: string | null
          floorId: string | null
          id: string
          scenery: Database["public"]["Enums"]["Scenery"] | null
          shared: boolean
          startedAt: string
          updatedAt: string
          userId: string
          xpAwarded: number
        }
        Insert: {
          createdAt?: string
          endedAt?: string | null
          floorId?: string | null
          id?: string
          scenery?: Database["public"]["Enums"]["Scenery"] | null
          shared?: boolean
          startedAt?: string
          updatedAt?: string
          userId: string
          xpAwarded?: number
        }
        Update: {
          createdAt?: string
          endedAt?: string | null
          floorId?: string | null
          id?: string
          scenery?: Database["public"]["Enums"]["Scenery"] | null
          shared?: boolean
          startedAt?: string
          updatedAt?: string
          userId?: string
          xpAwarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "WorkoutSession_floorId_fkey"
            columns: ["floorId"]
            isOneToOne: false
            referencedRelation: "Floor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "WorkoutSession_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      app_floor: { Args: never; Returns: string }
      app_role: { Args: never; Returns: string }
      app_uid: { Args: never; Returns: string }
      award_xp: {
        Args: { p_amount: number; p_user_id: string }
        Returns: {
          level: number
          leveled_up: number
          xp: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_conv_member: { Args: { conv: string }; Returns: boolean }
      is_operator: { Args: never; Returns: boolean }
    }
    Enums: {
      AutomationTrigger:
        | "signup"
        | "booking"
        | "missed_class"
        | "membership_lapsed"
      BookingState:
        | "booked"
        | "waitlist"
        | "attended"
        | "late_cancel"
        | "no_show"
        | "cancelled"
      ClassLoad: "open" | "fill" | "full"
      CreditReason:
        | "purchase"
        | "booking"
        | "refund"
        | "gift"
        | "adjustment"
        | "referral"
      DiscountKind: "percent" | "fixed"
      Equipment:
        | "barbell"
        | "dumbbell"
        | "kettlebell"
        | "cable"
        | "machine"
        | "band"
        | "bodyweight"
        | "trx"
      HealthProvider:
        | "apple_health"
        | "google_fit"
        | "garmin"
        | "whoop"
        | "fitbit"
      LeadStage: "lead" | "tour" | "trial" | "member" | "lost"
      MembershipStatus: "active" | "paused" | "cancelled" | "past_due"
      Muscle:
        | "push"
        | "pull"
        | "legs"
        | "core"
        | "full_body"
        | "arms"
        | "back"
        | "chest"
        | "glutes"
      NotificationKind:
        | "system"
        | "coach"
        | "social"
        | "commerce"
        | "booking"
        | "quest"
      OrderState: "cart" | "placed" | "paid" | "fulfilled" | "cancelled"
      PayState: "pending" | "paid" | "failed" | "refunded"
      Role: "member" | "coach" | "host" | "admin"
      Scenery: "oceanfront" | "rooftop" | "industrial" | "sunrise" | "forest"
      ShiftKind: "class" | "floor" | "open"
      TicketState: "reserved" | "paid" | "checked_in" | "refunded"
      Tier: "compass" | "sound" | "distant" | "founder"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      AutomationTrigger: [
        "signup",
        "booking",
        "missed_class",
        "membership_lapsed",
      ],
      BookingState: [
        "booked",
        "waitlist",
        "attended",
        "late_cancel",
        "no_show",
        "cancelled",
      ],
      ClassLoad: ["open", "fill", "full"],
      CreditReason: [
        "purchase",
        "booking",
        "refund",
        "gift",
        "adjustment",
        "referral",
      ],
      DiscountKind: ["percent", "fixed"],
      Equipment: [
        "barbell",
        "dumbbell",
        "kettlebell",
        "cable",
        "machine",
        "band",
        "bodyweight",
        "trx",
      ],
      HealthProvider: [
        "apple_health",
        "google_fit",
        "garmin",
        "whoop",
        "fitbit",
      ],
      LeadStage: ["lead", "tour", "trial", "member", "lost"],
      MembershipStatus: ["active", "paused", "cancelled", "past_due"],
      Muscle: [
        "push",
        "pull",
        "legs",
        "core",
        "full_body",
        "arms",
        "back",
        "chest",
        "glutes",
      ],
      NotificationKind: [
        "system",
        "coach",
        "social",
        "commerce",
        "booking",
        "quest",
      ],
      OrderState: ["cart", "placed", "paid", "fulfilled", "cancelled"],
      PayState: ["pending", "paid", "failed", "refunded"],
      Role: ["member", "coach", "host", "admin"],
      Scenery: ["oceanfront", "rooftop", "industrial", "sunrise", "forest"],
      ShiftKind: ["class", "floor", "open"],
      TicketState: ["reserved", "paid", "checked_in", "refunded"],
      Tier: ["compass", "sound", "distant", "founder"],
    },
  },
} as const
