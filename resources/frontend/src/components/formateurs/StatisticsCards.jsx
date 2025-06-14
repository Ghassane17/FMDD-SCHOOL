"use client"

import { useEffect, useState } from "react"
import { BookOpen, Star, Users, TrendingUp } from "lucide-react"
import { getInstructorStatistics } from "../../services/api_instructor"

const StatisticsCards = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getInstructorStatistics()
        setStats(data)
        localStorage.setItem("instructorStats", JSON.stringify(data))
      } catch (err) {
        setError("Erreur lors du chargement des statistiques.")
      } finally {
        setLoading(false)
      }
    }

    // Check if this is a page refresh (reload)
    const navigationEntries = performance.getEntriesByType("navigation")
    const isReload = navigationEntries.length > 0 && navigationEntries[0].type === "reload"

    if (isReload) {
      // On page refresh, always fetch new data
      fetchData()
    } else {
      // On initial load or navigation, use cached data if available
      const cachedStats = localStorage.getItem("instructorStats")
      if (cachedStats) {
        setStats(JSON.parse(cachedStats))
        setLoading(false)
      } else {
        fetchData()
      }
    }
  }, [])

  // Define card configurations
  const cards = [
    {
      title: "Total de cours publiés",
      value: stats?.totalCourses ?? "-",
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      color: "blue",
      trend: stats?.coursesTrend ?? 0,
    },
    {
      title: "Total d'apprenants formés",
      value: stats?.totalStudents ?? "-",
      icon: <Users className="h-8 w-8 text-emerald-600" />,
      color: "emerald",
      trend: stats?.studentsTrend ?? 0,
    },
    {
      title: "Note moyenne globale",
      value: (stats?.averageRating ?? 0) + "/5",
      icon: <Star className="h-8 w-8 text-amber-500" />,
      color: "amber",
      trend: stats?.ratingTrend ?? 0,
    },
  ]

  // Shimmer effect component for loading state
  const ShimmerEffect = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
  )

  // Skeleton loader for a single card
  const SkeletonCard = ({ delay = 0 }) => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden relative" style={{ animationDelay: `${delay}ms` }}>
      <div className="p-6 relative overflow-hidden">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse"></div>
          <div className="h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md animate-pulse"></div>
          <div className="h-5 w-36 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md animate-pulse"></div>
        </div>
        <ShimmerEffect />
      </div>
      <div className="h-1.5 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
    </div>
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SkeletonCard delay={0} />
        <SkeletonCard delay={150} />
        <SkeletonCard delay={300} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-center mb-10">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {error}
      </div>
    )
  }

  // Helper function to get the appropriate trend icon and color
  const getTrendIndicator = (trend) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (trend < 0) {
      return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />
    }
    return null
  }

  // Helper function to get gradient colors based on card type
  const getGradient = (color) => {
    switch (color) {
      case "blue":
        return "from-blue-500/10 to-blue-600/5"
      case "emerald":
        return "from-emerald-500/10 to-emerald-600/5"
      case "amber":
        return "from-amber-500/10 to-amber-600/5"
      default:
        return "from-gray-100 to-gray-50"
    }
  }

  // Helper function to get border colors based on card type
  const getBorderColor = (color) => {
    switch (color) {
      case "blue":
        return "border-blue-100"
      case "emerald":
        return "border-emerald-100"
      case "amber":
        return "border-amber-100"
      default:
        return "border-gray-100"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {cards.map((card, idx) => {
        const gradientClass = getGradient(card.color)
        const borderClass = getBorderColor(card.color)

        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl shadow-md border ${borderClass} overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="p-6 relative">
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientClass} mb-4 inline-block`}>{card.icon}</div>
                <div className="flex items-baseline justify-center gap-2">
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {card.value}
                  </h3>
                  {card.trend !== 0 && (
                    <span className="flex items-center text-sm font-medium">
                      {getTrendIndicator(card.trend)}
                      <span className={card.trend > 0 ? "text-green-600" : "text-red-600"}>
                        {Math.abs(card.trend)}%
                      </span>
                    </span>
                  )}
                </div>
                <p className="text-gray-600 font-medium mt-2">{card.title}</p>
              </div>
            </div>
            <div
              className={`h-1.5 w-full bg-gradient-to-r from-transparent via-${card.color}-500 to-transparent opacity-70`}
            ></div>
          </div>
        )
      })}
    </div>
  )
}

export default StatisticsCards
