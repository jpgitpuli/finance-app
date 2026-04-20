'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import TileCard from './TileCard'
import Speedometer from './Speedometer'

interface RealEstateTotals {
  purchaseCost: number
  marketValue: number
  liability: number
  equity: number
}

interface SharePortfolio {
  totalCostBaseLocal: number
  totalQuantity: number
  totalMarketValue: number
  totalGrowth: number
  growthPercentage: number
  holdingCount: number
}

export default function Home() {
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [personalRE, setPersonalRE] = useState<RealEstateTotals>({ purchaseCost: 0, marketValue: 0, liability: 0, equity: 0 })
  const [smsfRE, setSmsfRE] = useState<RealEstateTotals>({ purchaseCost: 0, marketValue: 0, liability: 0, equity: 0 })
  const [sharePortfolio, setSharePortfolio] = useState<SharePortfolio>({
    totalCostBaseLocal: 0,
    totalQuantity: 0,
    totalMarketValue: 0,
    totalGrowth: 0,
    growthPercentage: 0,
    holdingCount: 0,
  })
  const [superannuationTotal, setSuperannuationTotal] = useState(0)
  const [motorVehiclesTotal, setMotorVehiclesTotal] = useState(0)
  const [jewelleryTotalAUD, setJewelleryTotalAUD] = useState(0)
  const [overseasAssetsTotalAUD, setOverseasAssetsTotalAUD] = useState(0)
  const [termDepositsTotalAUD, setTermDepositsTotalAUD] = useState(0)
  const [speedometerValue, setSpeedometerValue] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
        })
      ])
    }

    async function fetchAll() {
      try {
        await Promise.allSettled([
          withTimeout(fetchTransactions(), 8000),
          withTimeout(fetchRealEstate(), 8000),
          withTimeout(fetchSharePortfolio(), 8000),
          withTimeout(fetchSuperannuation(), 8000),
          withTimeout(fetchMotorVehicles(), 8000),
          withTimeout(fetchJewellery(), 8000),
          withTimeout(fetchOverseasAssets(), 8000)
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  useEffect(() => {
    calculateSpeedometerValue()
  }, [
    totalIncome,
    totalExpenses,
    personalRE.equity,
    smsfRE.equity,
    sharePortfolio.totalMarketValue,
    superannuationTotal,
    motorVehiclesTotal,
    jewelleryTotalAUD,
    overseasAssetsTotalAUD,
    termDepositsTotalAUD
  ])

  // Calculate speedometer value (in millions)
  const calculateSpeedometerValue = () => {
    // Sum of specified tiles: Net Cash Position + Personal Equity + SMSF Equity +
    // Share Portfolio Market Value + Superannuation + Motor Vehicles + Gold +
    // Land Value + Term Deposits
    const totalValue = (
      (totalIncome - totalExpenses) + // Net Cash Position (Income - Expenses)
      personalRE.equity + // Personal Assets Equity
      smsfRE.equity + // SMSF Trust Assets Equity
      sharePortfolio.totalMarketValue + // Share Portfolio Market Value
      superannuationTotal + // Superannuation
      motorVehiclesTotal + // Motor Vehicles
      jewelleryTotalAUD + // Gold (already in AUD)
      overseasAssetsTotalAUD + // Land Value (already in AUD)
      termDepositsTotalAUD // Term Deposits (already in AUD)
    )

    // Convert to millions and cap at 20M for the gauge
    const valueInMillions = totalValue / 1000000
    setSpeedometerValue(Math.min(valueInMillions, 20))
  }

  async function fetchTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type')

    if (error) { console.error('Error fetching transactions:', error); return }

    const rows = data ?? []

    const income = rows
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = rows
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

    setTotalIncome(income)
    setTotalExpenses(expenses)
  }

  async function fetchRealEstate() {
    const { data, error } = await supabase
      .from('real_estate')
      .select('property_type, purchase_cost, market_value, liability, equity')

    if (error) { console.error('Error fetching real estate:', error); return }

    const rows = data ?? []

    const personal = rows.filter(p => p.property_type === 'personal')
    const smsf = rows.filter(p => p.property_type === 'smsf')

    const sumTotals = (rows: typeof data): RealEstateTotals => ({
      purchaseCost: rows.reduce((sum, r) => sum + Number(r.purchase_cost), 0),
      marketValue: rows.reduce((sum, r) => sum + Number(r.market_value), 0),
      liability: rows.reduce((sum, r) => sum + Number(r.liability), 0),
      equity: rows.reduce((sum, r) => sum + Number(r.equity), 0),
    })

    setPersonalRE(sumTotals(personal))
    setSmsfRE(sumTotals(smsf))
  }

  async function fetchSharePortfolio() {
    const { data, error } = await supabase
      .from('share_portfolio')
      .select('cost_base_local, quantity')

    if (error) { console.error('Error fetching share portfolio:', error); return }

    const rows = data ?? []

    const totalCostBaseLocal = rows.reduce((sum, s) => sum + Number(s.cost_base_local || 0), 0)
    const totalQuantity = rows.reduce((sum, s) => sum + Number(s.quantity || 0), 0)
    const totalMarketValue = totalQuantity * 144.84 * 1.65
    const totalGrowth = totalMarketValue - totalCostBaseLocal
    const growthPercentage = totalCostBaseLocal > 0 ? (totalGrowth / totalCostBaseLocal) * 100 : 0

    setSharePortfolio({
      totalCostBaseLocal,
      totalQuantity,
      totalMarketValue,
      totalGrowth,
      growthPercentage,
      holdingCount: rows.length,
    })
  }

  async function fetchSuperannuation() {
    const { data, error } = await supabase
      .from('superannuation_contributions')
      .select('current_balance')

    if (error) { console.error('Error fetching superannuation:', error); return }

    const rows = data ?? []

    // Get the latest balance (assuming the table is ordered by date or id)
    const totalBalance = rows.length > 0 ? Math.max(...rows.map(s => Number(s.current_balance))) : 0
    setSuperannuationTotal(totalBalance)
  }

  async function fetchMotorVehicles() {
    const { data, error } = await supabase
      .from('motor_vehicles')
      .select('current_value')

    if (error) { console.error('Error fetching motor vehicles:', error); return }

    const rows = data ?? []

    const totalValue = rows.reduce((sum, v) => sum + Number(v.current_value), 0)
    setMotorVehiclesTotal(totalValue)
  }

  async function fetchJewellery() {
    const { data, error } = await supabase
      .from('jewellery')
      .select('total_value')

    if (error) { console.error('Error fetching jewellery:', error); return }

    const rows = data ?? []

    const totalValueINR = rows.reduce((sum, j) => sum + Number(j.total_value), 0)
    const totalValueAUD = totalValueINR / 68 // Convert INR to AUD
    setJewelleryTotalAUD(totalValueAUD)
  }

  async function fetchOverseasAssets() {
    try {
      // Fetch all overseas assets
      const { data: allAssets, error: assetsError } = await supabase
        .from('overseas_assets')
        .select('asset_type, value, currency')

      if (assetsError) {
        throw new Error(`Error fetching overseas assets: ${assetsError.message || assetsError}`)
      }

      // Fetch exchange rates
      const { data: rates, error: ratesError } = await supabase
        .from('exchange_rates')
        .select('value_curr, value_local, curr_local')

      if (ratesError) {
        throw new Error(`Error fetching exchange rates: ${ratesError.message || ratesError}`)
      }

      const assetsList = allAssets ?? []
      const ratesList = rates ?? []

      // Build rate map
      const rateMap = new Map<string, number>()
      ratesList.forEach(rate => {
        if (rate.value_curr && rate.curr_local === 'AUD') {
          rateMap.set(rate.value_curr, Number(rate.value_local))
        }
      })

      // Calculate totals for different asset types
      let landTotalAUD = 0
      let termDepositTotalAUD = 0

      assetsList.forEach(asset => {
        const assetValue = Number(asset.value)
        const assetCurrency = asset.currency || 'INR'
        const exchangeRate = assetCurrency === 'INR' ? rateMap.get('INR') ?? 1 : 1

        if (asset.asset_type === 'Land') {
          landTotalAUD += assetValue * exchangeRate
        } else if (asset.asset_type === 'Term Deposit') {
          termDepositTotalAUD += assetValue * exchangeRate
        }
      })

      setOverseasAssetsTotalAUD(landTotalAUD)
      setTermDepositsTotalAUD(termDepositTotalAUD)
    } catch (error) {
      console.error('Error fetching overseas assets or exchange rates:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const netPosition = totalIncome - totalExpenses

  const SectionHeading = ({ title }: { title: string }) => (
    <div className="col-span-full mt-8 mb-2">
      <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-gray-300 pb-2">{title}</h2>
    </div>
  )

  const RowLabel = ({ label }: { label: string }) => (
    <div className="col-span-full">
      <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto relative">
        {/* Speedometer in top right corner */}
        <div className="absolute top-0 right-0 z-10">
          <Speedometer value={speedometerValue} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Jaitra Finance Dashboard</h1>
          <p className="text-gray-500 mt-1">Your complete financial overview</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <SectionHeading title="1. Income & Expenses" />
          <TileCard
            title="Total Income"
            value={loading ? 'Loading...' : formatCurrency(totalIncome)}
            description="Sum of all income"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            iconColor="text-blue-500"
          />
          <TileCard
            title="Total Expenses"
            value={loading ? 'Loading...' : formatCurrency(totalExpenses)}
            description="Sum of all expenses"
            bgColor="bg-red-50"
            borderColor="border-red-200"
            iconColor="text-red-500"
          />
          <TileCard
            title="Net Cash Position"
            value={loading ? 'Loading...' : formatCurrency(netPosition)}
            description="Income minus expenses"
            bgColor={netPosition >= 0 ? 'bg-green-50' : 'bg-orange-50'}
            borderColor={netPosition >= 0 ? 'border-green-200' : 'border-orange-200'}
            iconColor={netPosition >= 0 ? 'text-green-500' : 'text-orange-500'}
          />

          <SectionHeading title="2. Real Estate" />
          <RowLabel label="Personal Assets" />
          <TileCard
            title="Purchase Cost"
            value={loading ? 'Loading...' : formatCurrency(personalRE.purchaseCost)}
            description="Total cost incl. stamp duty"
            bgColor="bg-orange-50"
            borderColor="border-orange-200"
            iconColor="text-orange-500"
          />
          <TileCard
            title="Market Value"
            value={loading ? 'Loading...' : formatCurrency(personalRE.marketValue)}
            description="Current market value"
            bgColor="bg-orange-50"
            borderColor="border-orange-200"
            iconColor="text-orange-500"
          />
          <TileCard
            title="Liabilities"
            value={loading ? 'Loading...' : formatCurrency(personalRE.liability)}
            description="Total loans outstanding"
            bgColor="bg-orange-50"
            borderColor="border-orange-200"
            iconColor="text-orange-500"
          />
          <TileCard
            title="Equity Position"
            value={loading ? 'Loading...' : formatCurrency(personalRE.equity)}
            description="Market value minus loans"
            bgColor="bg-orange-50"
            borderColor="border-orange-200"
            iconColor="text-orange-500"
          />

          <RowLabel label="SMSF Trust Assets" />
          <TileCard
            title="Purchase Cost"
            value={loading ? 'Loading...' : formatCurrency(smsfRE.purchaseCost)}
            description="Total cost incl. stamp duty"
            bgColor="bg-amber-50"
            borderColor="border-amber-200"
            iconColor="text-amber-500"
          />
          <TileCard
            title="Market Value"
            value={loading ? 'Loading...' : formatCurrency(smsfRE.marketValue)}
            description="Current market value"
            bgColor="bg-amber-50"
            borderColor="border-amber-200"
            iconColor="text-amber-500"
          />
          <TileCard
            title="Liabilities"
            value={loading ? 'Loading...' : formatCurrency(smsfRE.liability)}
            description="Total loans outstanding"
            bgColor="bg-amber-50"
            borderColor="border-amber-200"
            iconColor="text-amber-500"
          />
          <TileCard
            title="Equity Position"
            value={loading ? 'Loading...' : formatCurrency(smsfRE.equity)}
            description="Market value minus loans"
            bgColor="bg-amber-50"
            borderColor="border-amber-200"
            iconColor="text-amber-500"
          />

          <SectionHeading title="3. Share Portfolio" />
          <TileCard
            title="Investments"
            value={loading ? 'Loading...' : formatCurrency(sharePortfolio.totalCostBaseLocal)}
            description={`${sharePortfolio.holdingCount} stocks held`}
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            iconColor="text-purple-500"
          />
          <TileCard
            title="Market Value"
            value={loading ? 'Loading...' : formatCurrency(sharePortfolio.totalMarketValue)}
            description={`${sharePortfolio.totalQuantity.toFixed(2)} shares`}
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            iconColor="text-purple-500"
          />
          <TileCard
            title="Growth"
            value={loading ? 'Loading...' : formatCurrency(sharePortfolio.totalGrowth)}
            description={loading ? 'Loading...' : formatPercentage(sharePortfolio.growthPercentage)}
            bgColor={sharePortfolio.totalGrowth >= 0 ? 'bg-purple-50' : 'bg-purple-50'}
            borderColor={sharePortfolio.totalGrowth >= 0 ? 'border-purple-200' : 'border-purple-200'}
            iconColor={sharePortfolio.totalGrowth >= 0 ? 'text-purple-500' : 'text-purple-500'}
          />

          <SectionHeading title="4. Other Assets" />
          <TileCard title="Superannuation" value={loading ? 'Loading...' : formatCurrency(superannuationTotal)} description="Retirement savings" bgColor="bg-teal-50" borderColor="border-teal-200" iconColor="text-teal-500" />
          <TileCard title="Motor Vehicles" value={loading ? 'Loading...' : formatCurrency(motorVehiclesTotal)} description="Total vehicle values" bgColor="bg-teal-50" borderColor="border-teal-200" iconColor="text-teal-500" />
          <TileCard title="Gold" value={loading ? 'Loading...' : formatCurrency(jewelleryTotalAUD)} description="Jewellery value in AUD" bgColor="bg-teal-50" borderColor="border-teal-200" iconColor="text-teal-500" />

          <SectionHeading title="5. Overseas Assets" />
          <TileCard title="Land Value" value={loading ? 'Loading...' : formatCurrency(overseasAssetsTotalAUD)} description="Total land value in AUD" bgColor="bg-indigo-50" borderColor="border-indigo-200" iconColor="text-indigo-500" />
          <TileCard title="Term Deposits" value={loading ? 'Loading...' : formatCurrency(termDepositsTotalAUD)} description="Overseas deposits" bgColor="bg-indigo-50" borderColor="border-indigo-200" iconColor="text-indigo-500" />

        </div>
      </div>
    </main>
  )
}