const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const NUMBER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1
});

const calculators = {
  striping: {
    fields: [
      ["lines", "Regular parking lines", 100],
      ["pricePerLine", "Price per line", 6, "money"],
      ["handicapSymbols", "Handicap symbols", 2],
      ["pricePerSymbol", "Price per handicap symbol", 25, "money"],
      ["materials", "Paint/materials", 170, "money"],
      ["hours", "On-site hours", 2.5],
      ["travel", "Gas/travel", 0, "money"]
    ],
    results: [
      ["lineRevenue", "Line revenue", "money"],
      ["symbolRevenue", "Handicap symbol revenue", "money"],
      ["totalRevenue", "Total revenue", "money"],
      ["profit", "Estimated profit before overhead", "money", true],
      ["revenuePerHour", "Revenue per on-site hour", "money"],
      ["profitPerHour", "Profit per on-site hour", "money"]
    ],
    calculate: (v) => {
      const lineRevenue = v.lines * v.pricePerLine;
      const symbolRevenue = v.handicapSymbols * v.pricePerSymbol;
      const totalRevenue = lineRevenue + symbolRevenue;
      const profit = totalRevenue - v.materials - v.travel;
      return {
        lineRevenue,
        symbolRevenue,
        totalRevenue,
        profit,
        revenuePerHour: divide(totalRevenue, v.hours),
        profitPerHour: divide(profit, v.hours)
      };
    }
  },
  equipment: {
    fields: [
      ["equipmentCost", "Equipment cost", 3500, "money"],
      ["profitPerJob", "Average profit per job", 250, "money"],
      ["jobsPerWeek", "Jobs per week", 3],
      ["extraMonthlyCosts", "Extra monthly costs", 150, "money"]
    ],
    results: [
      ["jobsNeeded", "Jobs needed to pay off equipment", "number", true],
      ["weeksNeeded", "Weeks to pay off equipment", "number"],
      ["monthlyGrossProfit", "Monthly gross profit", "money"],
      ["monthlyNetProfit", "Monthly profit after extra costs", "money"]
    ],
    calculate: (v) => {
      const jobsNeeded = divide(v.equipmentCost, v.profitPerJob);
      const monthlyGrossProfit = v.profitPerJob * v.jobsPerWeek * 4.33;
      return {
        jobsNeeded,
        weeksNeeded: divide(jobsNeeded, v.jobsPerWeek),
        monthlyGrossProfit,
        monthlyNetProfit: monthlyGrossProfit - v.extraMonthlyCosts
      };
    }
  },
  junk: {
    fields: [
      ["basePrice", "Base job price", 250, "money"],
      ["dumpFee", "Dump/tipping fee", 65, "money"],
      ["laborHours", "Labor hours", 2],
      ["laborCost", "Labor cost per hour", 25, "money"],
      ["fuel", "Fuel/travel", 25, "money"],
      ["helperCost", "Extra helper cost", 0, "money"],
      ["markup", "Desired profit markup percent", 25, "percent"]
    ],
    results: [
      ["totalCost", "Total job cost", "money"],
      ["suggestedPrice", "Suggested minimum price", "money", true],
      ["profit", "Estimated profit at entered price", "money"],
      ["profitPerHour", "Profit per labor hour", "money"]
    ],
    calculate: (v) => {
      const totalCost = v.dumpFee + (v.laborHours * v.laborCost) + v.fuel + v.helperCost;
      const profit = v.basePrice - totalCost;
      return {
        totalCost,
        suggestedPrice: totalCost * (1 + v.markup / 100),
        profit,
        profitPerHour: divide(profit, v.laborHours)
      };
    }
  },
  pressure: {
    fields: [
      ["jobPrice", "Job price", 300, "money"],
      ["materials", "Chemical/material cost", 35, "money"],
      ["fuel", "Fuel/travel", 25, "money"],
      ["laborHours", "Labor hours", 3],
      ["helperCost", "Helper cost", 0, "money"],
      ["wear", "Equipment wear allowance", 20, "money"]
    ],
    results: [
      ["totalCosts", "Total costs", "money"],
      ["profit", "Estimated profit", "money", true],
      ["profitPerHour", "Profit per hour", "money"],
      ["revenuePerHour", "Revenue per hour", "money"]
    ],
    calculate: (v) => {
      const totalCosts = v.materials + v.fuel + v.helperCost + v.wear;
      const profit = v.jobPrice - totalCosts;
      return {
        totalCosts,
        profit,
        profitPerHour: divide(profit, v.laborHours),
        revenuePerHour: divide(v.jobPrice, v.laborHours)
      };
    }
  },
  stump: {
    fields: [
      ["jobPrice", "Job price", 350, "money"],
      ["fuel", "Fuel/travel", 35, "money"],
      ["wear", "Teeth/wear allowance", 25, "money"],
      ["laborHours", "Labor hours", 2],
      ["cleanup", "Dump/chip cleanup cost", 0, "money"],
      ["equipmentPayment", "Equipment payment per month", 400, "money"],
      ["jobsPerMonth", "Jobs per month", 8]
    ],
    results: [
      ["profitPerJob", "Profit per job", "money", true],
      ["profitPerHour", "Profit per hour", "money"],
      ["monthlyBefore", "Monthly profit before overhead", "money"],
      ["monthlyAfter", "Monthly profit after equipment payment", "money"]
    ],
    calculate: (v) => {
      const profitPerJob = v.jobPrice - v.fuel - v.wear - v.cleanup;
      const monthlyBefore = profitPerJob * v.jobsPerMonth;
      return {
        profitPerJob,
        profitPerHour: divide(profitPerJob, v.laborHours),
        monthlyBefore,
        monthlyAfter: monthlyBefore - v.equipmentPayment
      };
    }
  },
  bounce: {
    fields: [
      ["rentalPrice", "Rental price per event", 175, "money"],
      ["eventsPerMonth", "Events per month", 12],
      ["cleaning", "Cleaning/maintenance per rental", 15, "money"],
      ["delivery", "Delivery fuel per rental", 20, "money"],
      ["insurance", "Monthly insurance", 150, "money"],
      ["equipmentCost", "Equipment cost", 2000, "money"]
    ],
    results: [
      ["monthlyRevenue", "Monthly revenue", "money"],
      ["variableCosts", "Monthly variable costs", "money"],
      ["profitBeforePayback", "Monthly profit before equipment payback", "money", true],
      ["eventsToPayOff", "Events to pay off equipment", "number"],
      ["monthsToPayOff", "Months to pay off equipment", "number"]
    ],
    calculate: (v) => {
      const monthlyRevenue = v.rentalPrice * v.eventsPerMonth;
      const variableCosts = (v.cleaning + v.delivery) * v.eventsPerMonth + v.insurance;
      const profitBeforePayback = monthlyRevenue - variableCosts;
      const profitPerEvent = v.rentalPrice - v.cleaning - v.delivery;
      return {
        monthlyRevenue,
        variableCosts,
        profitBeforePayback,
        eventsToPayOff: divide(v.equipmentCost, profitPerEvent),
        monthsToPayOff: divide(v.equipmentCost, profitBeforePayback)
      };
    }
  },
  vending: {
    fields: [
      ["machines", "Machines", 1],
      ["salesPerDay", "Sales per machine per day", 20],
      ["pricePerItem", "Price per item", 1.5, "money"],
      ["costPerItem", "Cost per item", 0.65, "money"],
      ["locationFee", "Monthly location fee", 0, "money"],
      ["restockCost", "Monthly fuel/restock cost", 40, "money"],
      ["machineCost", "Machine cost", 2500, "money"]
    ],
    results: [
      ["dailyGross", "Daily gross profit", "money"],
      ["monthlyGross", "Monthly gross profit", "money"],
      ["monthlyNet", "Monthly net profit", "money", true],
      ["monthsToPayOff", "Months to pay off machine", "number"]
    ],
    calculate: (v) => {
      const dailyGross = v.machines * v.salesPerDay * (v.pricePerItem - v.costPerItem);
      const monthlyGross = dailyGross * 30;
      const monthlyNet = monthlyGross - v.locationFee - v.restockCost;
      return {
        dailyGross,
        monthlyGross,
        monthlyNet,
        monthsToPayOff: divide(v.machineCost * v.machines, monthlyNet)
      };
    }
  },
  foodtruck: {
    fields: [
      ["truckCost", "Truck/trailer cost", 60000, "money"],
      ["buildout", "Equipment/buildout", 20000, "money"],
      ["permits", "Permits/licenses", 3000, "money"],
      ["inventory", "Initial food inventory", 2500, "money"],
      ["insurance", "Insurance", 2000, "money"],
      ["branding", "Branding/website", 1000, "money"],
      ["cushion", "Emergency cushion", 10000, "money"]
    ],
    results: [
      ["startupCost", "Total startup cost", "money", true],
      ["cushion", "Emergency cushion", "money"],
      ["cashNeeded", "Total cash needed", "money"],
      ["monthlySalesNeeded", "Monthly sales needed to recover startup over 12 months", "money"]
    ],
    calculate: (v) => {
      const startupCost = v.truckCost + v.buildout + v.permits + v.inventory + v.insurance + v.branding;
      return {
        startupCost,
        cushion: v.cushion,
        cashNeeded: startupCost + v.cushion,
        monthlySalesNeeded: divide(startupCost, 12)
      };
    }
  },
  first100k: {
    fields: [
      ["revenueGoal", "Revenue goal", 100000, "money"],
      ["averageJobValue", "Average job value", 500, "money"],
      ["closeRate", "Close rate percent", 30, "percent"],
      ["leadsPerWeek", "Leads per week", 10],
      ["profitMargin", "Profit margin percent", 40, "percent"]
    ],
    results: [
      ["jobsNeeded", "Jobs needed", "number", true],
      ["leadsNeeded", "Leads needed", "number"],
      ["weeksToGoal", "Weeks to goal", "number"],
      ["estimatedProfit", "Estimated profit", "money"]
    ],
    calculate: (v) => {
      const jobsNeeded = divide(v.revenueGoal, v.averageJobValue);
      const leadsNeeded = divide(jobsNeeded, v.closeRate / 100);
      return {
        jobsNeeded,
        leadsNeeded,
        weeksToGoal: divide(leadsNeeded, v.leadsPerWeek),
        estimatedProfit: v.revenueGoal * (v.profitMargin / 100)
      };
    }
  },
  lawn: {
    fields: [
      ["basePrice", "Base job price", 50, "money"],
      ["mowingHours", "Mowing time hours", 1],
      ["travel", "Travel/fuel", 10, "money"],
      ["laborCost", "Labor cost per hour", 25, "money"],
      ["wear", "Equipment wear", 5, "money"],
      ["markup", "Desired profit markup percent", 30, "percent"]
    ],
    results: [
      ["totalCost", "Total cost", "money"],
      ["profit", "Estimated profit at entered price", "money", true],
      ["suggestedPrice", "Suggested price with markup", "money"],
      ["profitPerHour", "Profit per hour", "money"]
    ],
    calculate: (v) => {
      const totalCost = (v.mowingHours * v.laborCost) + v.travel + v.wear;
      const profit = v.basePrice - totalCost;
      return {
        totalCost,
        profit,
        suggestedPrice: totalCost * (1 + v.markup / 100),
        profitPerHour: divide(profit, v.mowingHours)
      };
    }
  },
  plumbingStartup: {
    fields: [
      ["trainingLicensing", "Training/licensing path costs", 4500, "money"],
      ["tools", "Tools and equipment", 8500, "money"],
      ["vehicle", "Work vehicle setup", 18000, "money"],
      ["insurance", "Insurance and bonding", 3500, "money"],
      ["marketing", "Launch marketing", 2500, "money"],
      ["workingCapital", "Working capital cushion", 10000, "money"]
    ],
    results: [
      ["startupTotal", "Estimated startup total", "money", true],
      ["cashBeforeCushion", "Estimated cash before cushion", "money"],
      ["cushion", "Planning cushion", "money"],
      ["jobsToRecover", "Jobs to recover startup at $450 profit/job", "number"]
    ],
    calculate: (v) => {
      const cashBeforeCushion = v.trainingLicensing + v.tools + v.vehicle + v.insurance + v.marketing;
      const startupTotal = cashBeforeCushion + v.workingCapital;
      return { startupTotal, cashBeforeCushion, cushion: v.workingCapital, jobsToRecover: divide(startupTotal, 450) };
    }
  },
  hvacStartup: {
    fields: [
      ["certifications", "Certifications/licensing", 6000, "money"],
      ["tools", "Tools and diagnostic equipment", 14000, "money"],
      ["vehicle", "Service vehicle setup", 22000, "money"],
      ["insurance", "Insurance and bonding", 4500, "money"],
      ["marketing", "Launch marketing", 3000, "money"],
      ["workingCapital", "Working capital cushion", 12000, "money"]
    ],
    results: [
      ["startupTotal", "Estimated startup total", "money", true],
      ["regulatedPathCost", "Licensing, insurance, and setup costs", "money"],
      ["cushion", "Planning cushion", "money"],
      ["jobsToRecover", "Jobs to recover startup at $600 profit/job", "number"]
    ],
    calculate: (v) => {
      const regulatedPathCost = v.certifications + v.insurance + v.marketing;
      const startupTotal = v.certifications + v.tools + v.vehicle + v.insurance + v.marketing + v.workingCapital;
      return { startupTotal, regulatedPathCost, cushion: v.workingCapital, jobsToRecover: divide(startupTotal, 600) };
    }
  },
  electricalStartup: {
    fields: [
      ["licensePath", "License/apprenticeship path costs", 5000, "money"],
      ["tools", "Tools and meters", 7500, "money"],
      ["vehicle", "Vehicle setup", 16000, "money"],
      ["insurance", "Insurance and bonding", 4000, "money"],
      ["permitsAdmin", "Permits/admin setup", 2000, "money"],
      ["workingCapital", "Working capital cushion", 9000, "money"]
    ],
    results: [
      ["startupTotal", "Estimated startup total", "money", true],
      ["complianceSetup", "License, permit, and insurance setup", "money"],
      ["cushion", "Planning cushion", "money"],
      ["jobsToRecover", "Jobs to recover startup at $500 profit/job", "number"]
    ],
    calculate: (v) => {
      const complianceSetup = v.licensePath + v.insurance + v.permitsAdmin;
      const startupTotal = v.licensePath + v.tools + v.vehicle + v.insurance + v.permitsAdmin + v.workingCapital;
      return { startupTotal, complianceSetup, cushion: v.workingCapital, jobsToRecover: divide(startupTotal, 500) };
    }
  },
  pestStartup: {
    fields: [
      ["licensing", "Licensing/training", 2500, "money"],
      ["equipment", "Sprayers and equipment", 4500, "money"],
      ["initialChemicals", "Initial chemical inventory", 2500, "money"],
      ["vehicle", "Vehicle setup", 12000, "money"],
      ["insurance", "Insurance", 3000, "money"],
      ["marketing", "Launch marketing", 2500, "money"]
    ],
    results: [
      ["startupTotal", "Estimated startup total", "money", true],
      ["regulatedCosts", "Training, chemical, and insurance costs", "money"],
      ["monthlyRevenueNeeded", "Monthly revenue to recover over 12 months", "money"],
      ["customersNeeded", "Customers at $65/month to cover recovery target", "number"]
    ],
    calculate: (v) => {
      const startupTotal = v.licensing + v.equipment + v.initialChemicals + v.vehicle + v.insurance + v.marketing;
      const monthlyRevenueNeeded = divide(startupTotal, 12);
      return { startupTotal, regulatedCosts: v.licensing + v.initialChemicals + v.insurance, monthlyRevenueNeeded, customersNeeded: divide(monthlyRevenueNeeded, 65) };
    }
  },
  towingStartup: {
    fields: [
      ["truck", "Tow truck/down payment", 65000, "money"],
      ["equipment", "Chains, lights, and gear", 6000, "money"],
      ["insurance", "Commercial insurance", 12000, "money"],
      ["permits", "Permits and compliance", 3500, "money"],
      ["dispatch", "Dispatch/software setup", 1500, "money"],
      ["workingCapital", "Working capital cushion", 15000, "money"]
    ],
    results: [
      ["startupTotal", "Estimated startup total", "money", true],
      ["complianceAndInsurance", "Compliance and insurance costs", "money"],
      ["cushion", "Planning cushion", "money"],
      ["callsToRecover", "Calls to recover startup at $125 profit/call", "number"]
    ],
    calculate: (v) => {
      const startupTotal = v.truck + v.equipment + v.insurance + v.permits + v.dispatch + v.workingCapital;
      return { startupTotal, complianceAndInsurance: v.insurance + v.permits, cushion: v.workingCapital, callsToRecover: divide(startupTotal, 125) };
    }
  },
  golfChallenge: {
    fields: [
      ["bucketPrice", "Price per bucket", 100, "money"],
      ["ballsPerBucket", "Balls per bucket", 100],
      ["firstTimePlayersPerDay", "First-time players per day", 40],
      ["repeatBucketRate", "Repeat bucket rate percent", 35, "percent"],
      ["daysOpenPerMonth", "Days open per month", 12],
      ["prizeAmount", "Prize amount", 10000, "money"],
      ["expectedPrizeWins", "Expected prize wins per month", 1],
      ["locationCost", "Location lease / site cost", 1000, "money"],
      ["signageCost", "Billboard / signage cost", 700, "money"],
      ["staffCost", "Staff cost", 1500, "money"],
      ["insurancePermits", "Insurance / permits / prize coverage", 1000, "money"],
      ["miscCosts", "Misc monthly costs", 500, "money"]
    ],
    results: [
      ["firstBucketRevenue", "First bucket revenue", "money"],
      ["repeatBucketRevenue", "Repeat bucket revenue", "money"],
      ["monthlyBucketRevenue", "Total monthly bucket revenue", "money"],
      ["prizePayoutCost", "Prize payout cost", "money"],
      ["operatingCosts", "Total monthly operating costs", "money"],
      ["monthlyProfit", "Estimated monthly profit before taxes", "money", true],
      ["bucketsToCoverPrize", "Buckets needed to cover one prize payout", "number"],
      ["breakEvenPlayersPerDay", "Break-even players per day", "number"]
    ],
    calculate: (v) => {
      const monthlyFirstBuckets = v.firstTimePlayersPerDay * v.daysOpenPerMonth;
      const monthlyRepeatBuckets = monthlyFirstBuckets * (v.repeatBucketRate / 100);
      const firstBucketRevenue = monthlyFirstBuckets * v.bucketPrice;
      const repeatBucketRevenue = monthlyRepeatBuckets * v.bucketPrice;
      const monthlyBucketRevenue = firstBucketRevenue + repeatBucketRevenue;
      const prizePayoutCost = v.prizeAmount * v.expectedPrizeWins;
      const operatingCosts = prizePayoutCost + v.locationCost + v.signageCost + v.staffCost + v.insurancePermits + v.miscCosts;
      const revenuePerFirstTimePlayer = v.bucketPrice * (1 + (v.repeatBucketRate / 100));
      return {
        firstBucketRevenue,
        repeatBucketRevenue,
        monthlyBucketRevenue,
        prizePayoutCost,
        operatingCosts,
        monthlyProfit: monthlyBucketRevenue - operatingCosts,
        bucketsToCoverPrize: divide(v.prizeAmount, v.bucketPrice),
        breakEvenPlayersPerDay: divide(operatingCosts, revenuePerFirstTimePlayer * v.daysOpenPerMonth)
      };
    }
  },
  mobileSauna: {
    fields: [
      ["rentalPrice", "Rental price per booking", 225, "money"],
      ["bookingsPerMonth", "Bookings per month", 14],
      ["fuelCleaning", "Fuel/cleaning per booking", 35, "money"],
      ["monthlyInsurance", "Monthly insurance/storage", 250, "money"],
      ["saunaCost", "Sauna/trailer cost", 18000, "money"],
      ["maintenance", "Monthly maintenance allowance", 150, "money"]
    ],
    results: [
      ["monthlyRevenue", "Monthly revenue", "money"],
      ["monthlyCosts", "Monthly operating costs", "money"],
      ["monthlyProfit", "Monthly profit before overhead", "money", true],
      ["monthsToPayOff", "Months to pay off sauna", "number"]
    ],
    calculate: (v) => {
      const monthlyRevenue = v.rentalPrice * v.bookingsPerMonth;
      const monthlyCosts = (v.fuelCleaning * v.bookingsPerMonth) + v.monthlyInsurance + v.maintenance;
      const monthlyProfit = monthlyRevenue - monthlyCosts;
      return { monthlyRevenue, monthlyCosts, monthlyProfit, monthsToPayOff: divide(v.saunaCost, monthlyProfit) };
    }
  },
  photoBooth: {
    fields: [
      ["rentalPrice", "Rental price per event", 450, "money"],
      ["eventsPerMonth", "Events per month", 8],
      ["assistantCost", "Assistant/labor per event", 100, "money"],
      ["travelSupplies", "Travel and supplies per event", 45, "money"],
      ["monthlySoftware", "Monthly software/insurance", 180, "money"],
      ["equipmentCost", "Booth/equipment cost", 6500, "money"]
    ],
    results: [
      ["monthlyRevenue", "Monthly revenue", "money"],
      ["monthlyCosts", "Monthly variable and fixed costs", "money"],
      ["monthlyProfit", "Monthly profit before overhead", "money", true],
      ["monthsToPayOff", "Months to pay off equipment", "number"]
    ],
    calculate: (v) => {
      const monthlyRevenue = v.rentalPrice * v.eventsPerMonth;
      const monthlyCosts = ((v.assistantCost + v.travelSupplies) * v.eventsPerMonth) + v.monthlySoftware;
      const monthlyProfit = monthlyRevenue - monthlyCosts;
      return { monthlyRevenue, monthlyCosts, monthlyProfit, monthsToPayOff: divide(v.equipmentCost, monthlyProfit) };
    }
  },
  christmasLights: {
    fields: [
      ["jobPrice", "Average install price", 1200, "money"],
      ["jobsPerSeason", "Jobs per season", 25],
      ["materialsPerJob", "Materials per job", 350, "money"],
      ["laborPerJob", "Labor per job", 300, "money"],
      ["marketing", "Season marketing", 2500, "money"],
      ["equipment", "Startup ladders, tools, safety gear, and storage", 1500, "money"]
    ],
    results: [
      ["seasonRevenue", "Estimated season revenue", "money"],
      ["seasonCosts", "Estimated season costs", "money"],
      ["seasonProfit", "Estimated season profit before overhead", "money", true],
      ["profitPerJob", "Estimated profit per job", "money"]
    ],
    calculate: (v) => {
      const seasonRevenue = v.jobPrice * v.jobsPerSeason;
      const seasonCosts = ((v.materialsPerJob + v.laborPerJob) * v.jobsPerSeason) + v.marketing + v.equipment;
      const seasonProfit = seasonRevenue - seasonCosts;
      return { seasonRevenue, seasonCosts, seasonProfit, profitPerJob: divide(seasonProfit, v.jobsPerSeason) };
    }
  },
  knifeSharpening: {
    fields: [
      ["averageTicket", "Average ticket", 45, "money"],
      ["customersPerDay", "Customers per workday", 12],
      ["workdaysPerMonth", "Workdays per month", 16],
      ["consumables", "Consumables per customer", 4, "money"],
      ["fuelMarketFees", "Monthly fuel/market fees", 350, "money"],
      ["equipmentCost", "Sharpening equipment cost", 2500, "money"]
    ],
    results: [
      ["monthlyRevenue", "Monthly revenue", "money"],
      ["monthlyCosts", "Monthly variable and fixed costs", "money"],
      ["monthlyProfit", "Monthly profit before overhead", "money", true],
      ["monthsToPayOff", "Months to pay off equipment", "number"]
    ],
    calculate: (v) => {
      const monthlyCustomers = v.customersPerDay * v.workdaysPerMonth;
      const monthlyRevenue = v.averageTicket * monthlyCustomers;
      const monthlyCosts = (v.consumables * monthlyCustomers) + v.fuelMarketFees;
      const monthlyProfit = monthlyRevenue - monthlyCosts;
      return { monthlyRevenue, monthlyCosts, monthlyProfit, monthsToPayOff: divide(v.equipmentCost, monthlyProfit) };
    }
  },
  epoxyGarage: {
    fields: [
      ["squareFeetPerJob", "Average square feet per job", 500],
      ["pricePerSqft", "Price per square foot", 8, "money"],
      ["materialCostPerSqft", "Material cost per square foot", 2.06, "money"],
      ["laborCostPerJob", "Labor cost per job", 650, "money"],
      ["jobsPerMonth", "Jobs per month", 14],
      ["monthlyOverhead", "Monthly overhead", 7300, "money"],
      ["adSpend", "Monthly ad spend", 2500, "money"],
      ["costPerLead", "Cost per lead", 60, "money"],
      ["closeRate", "Close rate percent", 25, "percent"],
      ["equipmentCost", "Equipment cost", 20000, "money"]
    ],
    results: [
      ["monthlyRevenue", "Monthly revenue", "money"],
      ["monthlyMaterialCost", "Monthly material cost", "money"],
      ["estimatedLeads", "Estimated leads from ad spend", "number"],
      ["estimatedJobsFromAds", "Estimated jobs from ads", "number"],
      ["monthlyProfit", "Estimated monthly profit before taxes", "money", true],
      ["monthsToPayOff", "Months to pay off equipment", "number"]
    ],
    calculate: (v) => {
      const monthlyRevenue = v.squareFeetPerJob * v.pricePerSqft * v.jobsPerMonth;
      const monthlyMaterialCost = v.squareFeetPerJob * v.materialCostPerSqft * v.jobsPerMonth;
      const laborCost = v.laborCostPerJob * v.jobsPerMonth;
      const estimatedLeads = divide(v.adSpend, v.costPerLead);
      const estimatedJobsFromAds = estimatedLeads * (v.closeRate / 100);
      const monthlyProfit = monthlyRevenue - monthlyMaterialCost - laborCost - v.monthlyOverhead - v.adSpend;
      return { monthlyRevenue, monthlyMaterialCost, estimatedLeads, estimatedJobsFromAds, monthlyProfit, monthsToPayOff: divide(v.equipmentCost, monthlyProfit) };
    }
  },
  backyardMovie: {
    fields: [
      ["basicPackagePrice", "Basic outdoor package price", 375, "money"],
      ["upgradedPackagePrice", "Upgraded party package price", 850, "money"],
      ["premiumIndoorPackagePrice", "Premium indoor inflatable theater package price", 1700, "money"],
      ["basicBookings", "Basic outdoor bookings per month", 6],
      ["upgradedBookings", "Upgraded party bookings per month", 4],
      ["premiumIndoorBookings", "Premium indoor bookings per month", 2],
      ["screenEquipmentCost", "Screen / projector / speaker equipment cost", 10000, "money"],
      ["indoorUpgradeCost", "Indoor inflatable theater upgrade cost", 3500, "money"],
      ["partyDecorCost", "Inflatable seats / LED chairs / decor cost", 2000, "money"],
      ["fuelPerEvent", "Fuel/travel per event", 35, "money"],
      ["helperCostPerEvent", "Helper cost per event", 75, "money"],
      ["monthlyOverhead", "Insurance / storage / marketing per month", 300, "money"]
    ],
    results: [
      ["basicRevenue", "Monthly basic package revenue", "money"],
      ["upgradedRevenue", "Monthly upgraded package revenue", "money"],
      ["premiumIndoorRevenue", "Monthly premium indoor revenue", "money"],
      ["monthlyRevenue", "Total monthly revenue", "money"],
      ["eventCosts", "Monthly event costs", "money"],
      ["monthlyOverhead", "Monthly overhead", "money"],
      ["monthlyProfit", "Estimated monthly profit before taxes", "money", true],
      ["equipmentInvestment", "Total equipment investment", "money"],
      ["eventsToRecover", "Events needed to recover equipment cost", "number"],
      ["averageRevenuePerEvent", "Revenue per event average", "money"]
    ],
    calculate: (v) => {
      const basicRevenue = v.basicPackagePrice * v.basicBookings;
      const upgradedRevenue = v.upgradedPackagePrice * v.upgradedBookings;
      const premiumIndoorRevenue = v.premiumIndoorPackagePrice * v.premiumIndoorBookings;
      const totalEvents = v.basicBookings + v.upgradedBookings + v.premiumIndoorBookings;
      const monthlyRevenue = basicRevenue + upgradedRevenue + premiumIndoorRevenue;
      const eventCosts = (v.fuelPerEvent + v.helperCostPerEvent) * totalEvents;
      const monthlyProfit = monthlyRevenue - eventCosts - v.monthlyOverhead;
      const equipmentInvestment = v.screenEquipmentCost + v.indoorUpgradeCost + v.partyDecorCost;
      const averageRevenuePerEvent = divide(monthlyRevenue, totalEvents);
      const averageProfitPerEvent = divide(monthlyProfit, totalEvents);
      return {
        basicRevenue,
        upgradedRevenue,
        premiumIndoorRevenue,
        monthlyRevenue,
        eventCosts,
        monthlyOverhead: v.monthlyOverhead,
        monthlyProfit,
        equipmentInvestment,
        eventsToRecover: divide(equipmentInvestment, averageProfitPerEvent),
        averageRevenuePerEvent
      };
    }
  },
  coldCake: {
    fields: [
      ["giftCost", "Cake/gift cost per prospect", 70, "money"],
      ["deliveryCost", "Delivery cost per prospect", 12, "money"],
      ["prospects", "Number of prospects", 100],
      ["bookedMeetingRate", "Booked meeting rate percent", 20, "percent"],
      ["closeRate", "Close rate percent", 25, "percent"],
      ["averageDealValue", "Average deal value", 5000, "money"],
      ["grossMargin", "Gross margin percent", 55, "percent"],
      ["repeatValue", "Repeat/LTV value per customer", 2500, "money"]
    ],
    results: [
      ["campaignCost", "Campaign cost", "money"],
      ["meetingsBooked", "Meetings booked", "number"],
      ["dealsClosed", "Estimated deals closed", "number"],
      ["revenue", "Estimated revenue", "money"],
      ["profit", "Estimated profit after campaign cost", "money", true],
      ["costPerMeeting", "Cost per booked meeting", "money"],
      ["costPerCustomer", "Cost per acquired customer", "money"],
      ["roi", "ROI percent", "number"]
    ],
    calculate: (v) => {
      const campaignCost = (v.giftCost + v.deliveryCost) * v.prospects;
      const meetingsBooked = v.prospects * (v.bookedMeetingRate / 100);
      const dealsClosed = meetingsBooked * (v.closeRate / 100);
      const revenue = dealsClosed * (v.averageDealValue + v.repeatValue);
      const grossProfit = revenue * (v.grossMargin / 100);
      const profit = grossProfit - campaignCost;
      return { campaignCost, meetingsBooked, dealsClosed, revenue, profit, costPerMeeting: divide(campaignCost, meetingsBooked), costPerCustomer: divide(campaignCost, dealsClosed), roi: divide(profit, campaignCost) * 100 };
    }
  },
  garageOrganization: {
    fields: [
      ["averageProjectPrice", "Average project price", 1800, "money"],
      ["projectsPerMonth", "Projects per month", 5],
      ["materialsPerProject", "Materials per project", 700, "money"],
      ["laborHoursPerProject", "Labor hours per project", 10],
      ["laborCostPerHour", "Labor cost per hour", 35, "money"],
      ["monthlyOverhead", "Monthly overhead", 500, "money"],
      ["adSpend", "Monthly ad spend", 900, "money"],
      ["equipmentCost", "Tools/equipment cost", 3000, "money"]
    ],
    results: [
      ["monthlyRevenue", "Monthly revenue", "money"],
      ["monthlyCosts", "Monthly costs", "money"],
      ["monthlyProfit", "Estimated monthly profit before taxes", "money", true],
      ["profitPerProject", "Estimated profit per project", "money"],
      ["breakEvenProjects", "Break-even projects per month", "number"],
      ["monthsToPayOff", "Months to pay off equipment", "number"]
    ],
    calculate: (v) => {
      const monthlyRevenue = v.averageProjectPrice * v.projectsPerMonth;
      const projectCost = v.materialsPerProject + (v.laborHoursPerProject * v.laborCostPerHour);
      const monthlyCosts = (projectCost * v.projectsPerMonth) + v.monthlyOverhead + v.adSpend;
      const monthlyProfit = monthlyRevenue - monthlyCosts;
      const profitPerProject = v.averageProjectPrice - projectCost;
      return { monthlyRevenue, monthlyCosts, monthlyProfit, profitPerProject, breakEvenProjects: divide(v.monthlyOverhead + v.adSpend, profitPerProject), monthsToPayOff: divide(v.equipmentCost, monthlyProfit) };
    }
  },
  mobileDetailing: {
    fields: [
      ["averageTicket", "Average ticket", 180, "money"],
      ["carsPerDay", "Cars per day", 3],
      ["workdaysPerMonth", "Workdays per month", 18],
      ["suppliesPerCar", "Supplies per car", 18, "money"],
      ["fuelPerDay", "Fuel per workday", 28, "money"],
      ["helperMonthly", "Monthly helper cost", 0, "money"],
      ["insuranceSoftware", "Monthly insurance/software", 260, "money"],
      ["equipmentCost", "Equipment cost", 4500, "money"]
    ],
    results: [
      ["monthlyRevenue", "Monthly revenue", "money"],
      ["monthlyCosts", "Monthly costs", "money"],
      ["monthlyProfit", "Estimated monthly profit before taxes", "money", true],
      ["profitPerCar", "Estimated profit per car", "money"],
      ["carsToPayOff", "Cars to pay off equipment", "number"],
      ["monthsToPayOff", "Months to pay off equipment", "number"]
    ],
    calculate: (v) => {
      const monthlyCars = v.carsPerDay * v.workdaysPerMonth;
      const monthlyRevenue = v.averageTicket * monthlyCars;
      const monthlyCosts = (v.suppliesPerCar * monthlyCars) + (v.fuelPerDay * v.workdaysPerMonth) + v.helperMonthly + v.insuranceSoftware;
      const monthlyProfit = monthlyRevenue - monthlyCosts;
      const profitPerCar = divide(monthlyProfit, monthlyCars);
      return { monthlyRevenue, monthlyCosts, monthlyProfit, profitPerCar, carsToPayOff: divide(v.equipmentCost, profitPerCar), monthsToPayOff: divide(v.equipmentCost, monthlyProfit) };
    }
  },
  windowTinting: {
    fields: [
      ["averageTicket", "Average ticket per vehicle", 325, "money"],
      ["vehiclesPerMonth", "Vehicles per month", 35],
      ["filmCostPerVehicle", "Film cost per vehicle", 55, "money"],
      ["laborHoursPerVehicle", "Labor hours per vehicle", 2.5],
      ["laborCostPerHour", "Labor cost per hour", 35, "money"],
      ["overhead", "Shop/mobile overhead", 900, "money"],
      ["adSpend", "Monthly ad spend", 900, "money"],
      ["equipmentCost", "Tools/equipment cost", 4500, "money"]
    ],
    results: [
      ["monthlyRevenue", "Monthly revenue", "money"],
      ["monthlyCosts", "Monthly costs", "money"],
      ["monthlyProfit", "Estimated monthly profit before taxes", "money", true],
      ["profitPerVehicle", "Estimated profit per vehicle", "money"],
      ["monthlyLaborHours", "Monthly labor hours", "number"],
      ["monthsToPayOff", "Months to pay off equipment", "number"]
    ],
    calculate: (v) => {
      const monthlyRevenue = v.averageTicket * v.vehiclesPerMonth;
      const laborCost = v.laborHoursPerVehicle * v.laborCostPerHour * v.vehiclesPerMonth;
      const filmCost = v.filmCostPerVehicle * v.vehiclesPerMonth;
      const monthlyCosts = laborCost + filmCost + v.overhead + v.adSpend;
      const monthlyProfit = monthlyRevenue - monthlyCosts;
      return { monthlyRevenue, monthlyCosts, monthlyProfit, profitPerVehicle: divide(monthlyProfit, v.vehiclesPerMonth), monthlyLaborHours: v.laborHoursPerVehicle * v.vehiclesPerMonth, monthsToPayOff: divide(v.equipmentCost, monthlyProfit) };
    }
  },
  gutterCleaning: {
    fields: [
      ["averageJobPrice", "Average job price", 175, "money"],
      ["jobsPerDay", "Jobs per day", 4],
      ["workdaysPerMonth", "Workdays per month", 14],
      ["fuelPerDay", "Fuel per day", 35, "money"],
      ["laborCostPerDay", "Labor cost per day", 180, "money"],
      ["suppliesPerJob", "Supplies/disposal per job", 8, "money"],
      ["insuranceMarketing", "Monthly insurance/marketing", 450, "money"],
      ["equipmentCost", "Ladder/equipment cost", 1800, "money"]
    ],
    results: [
      ["monthlyRevenue", "Monthly route revenue", "money"],
      ["monthlyCosts", "Monthly costs", "money"],
      ["monthlyProfit", "Estimated monthly profit before taxes", "money", true],
      ["profitPerDay", "Estimated profit per workday", "money"],
      ["jobsToPayOff", "Jobs to pay off equipment", "number"],
      ["monthsToPayOff", "Months to pay off equipment", "number"]
    ],
    calculate: (v) => {
      const monthlyJobs = v.jobsPerDay * v.workdaysPerMonth;
      const monthlyRevenue = v.averageJobPrice * monthlyJobs;
      const monthlyCosts = (v.fuelPerDay + v.laborCostPerDay) * v.workdaysPerMonth + (v.suppliesPerJob * monthlyJobs) + v.insuranceMarketing;
      const monthlyProfit = monthlyRevenue - monthlyCosts;
      const profitPerDay = divide(monthlyProfit, v.workdaysPerMonth);
      return { monthlyRevenue, monthlyCosts, monthlyProfit, profitPerDay, jobsToPayOff: divide(v.equipmentCost, divide(monthlyProfit, monthlyJobs)), monthsToPayOff: divide(v.equipmentCost, monthlyProfit) };
    }
  },
  fenceStaining: {
    fields: [
      ["averageSqft", "Average fence square feet", 1200],
      ["pricePerSqft", "Price per square foot", 1.75, "money"],
      ["stainCostPerSqft", "Stain/material cost per square foot", 0.42, "money"],
      ["laborHoursPerJob", "Labor hours per job", 9],
      ["laborCostPerHour", "Labor cost per hour", 35, "money"],
      ["jobsPerMonth", "Jobs per month", 6],
      ["monthlyOverhead", "Monthly overhead", 650, "money"],
      ["equipmentCost", "Sprayer/tools cost", 2800, "money"]
    ],
    results: [
      ["jobRevenue", "Revenue per job", "money"],
      ["profitPerJob", "Estimated profit per job", "money"],
      ["monthlyRevenue", "Monthly revenue", "money"],
      ["monthlyProfit", "Estimated monthly profit before taxes", "money", true],
      ["profitPerHour", "Estimated profit per labor hour", "money"],
      ["monthsToPayOff", "Months to pay off equipment", "number"]
    ],
    calculate: (v) => {
      const jobRevenue = v.averageSqft * v.pricePerSqft;
      const materialCost = v.averageSqft * v.stainCostPerSqft;
      const laborCost = v.laborHoursPerJob * v.laborCostPerHour;
      const profitPerJob = jobRevenue - materialCost - laborCost;
      const monthlyRevenue = jobRevenue * v.jobsPerMonth;
      const monthlyProfit = (profitPerJob * v.jobsPerMonth) - v.monthlyOverhead;
      return { jobRevenue, profitPerJob, monthlyRevenue, monthlyProfit, profitPerHour: divide(profitPerJob, v.laborHoursPerJob), monthsToPayOff: divide(v.equipmentCost, monthlyProfit) };
    }
  },
  applianceRepair: {
    fields: [
      ["serviceCalls", "Service calls per month", 55],
      ["diagnosticFee", "Diagnostic fee", 95, "money"],
      ["repairCloseRate", "Repair close rate percent", 65, "percent"],
      ["repairLaborProfit", "Average repair labor profit", 140, "money"],
      ["partsMarkupProfit", "Average parts markup profit", 45, "money"],
      ["fuelPerCall", "Fuel/travel per call", 12, "money"],
      ["softwareInsurance", "Monthly software/insurance", 450, "money"],
      ["toolsCost", "Tools/test equipment cost", 3500, "money"]
    ],
    results: [
      ["diagnosticRevenue", "Diagnostic revenue", "money"],
      ["closedRepairs", "Estimated closed repairs", "number"],
      ["repairRevenue", "Estimated repair revenue", "money"],
      ["monthlyRevenue", "Monthly revenue", "money"],
      ["monthlyCosts", "Monthly costs", "money"],
      ["monthlyProfit", "Estimated monthly profit before taxes", "money", true],
      ["monthsToPayOff", "Months to pay off tools", "number"]
    ],
    calculate: (v) => {
      const diagnosticRevenue = v.serviceCalls * v.diagnosticFee;
      const closedRepairs = v.serviceCalls * (v.repairCloseRate / 100);
      const repairRevenue = closedRepairs * (v.repairLaborProfit + v.partsMarkupProfit);
      const monthlyRevenue = diagnosticRevenue + repairRevenue;
      const monthlyCosts = (v.fuelPerCall * v.serviceCalls) + v.softwareInsurance;
      const monthlyProfit = monthlyRevenue - monthlyCosts;
      return { diagnosticRevenue, closedRepairs, repairRevenue, monthlyRevenue, monthlyCosts, monthlyProfit, monthsToPayOff: divide(v.toolsCost, monthlyProfit) };
    }
  },
  mobileDogGrooming: {
    fields: [
      ["averageGroomPrice", "Average groom price", 95, "money"],
      ["dogsPerDay", "Dogs per day", 5],
      ["workdaysPerMonth", "Workdays per month", 18],
      ["suppliesPerDog", "Supplies per dog", 9, "money"],
      ["fuelPerDay", "Fuel per day", 30, "money"],
      ["vanPayment", "Monthly van payment", 1200, "money"],
      ["insuranceSoftware", "Monthly insurance/software", 350, "money"],
      ["equipmentCost", "Van/equipment cost", 35000, "money"]
    ],
    results: [
      ["monthlyRevenue", "Monthly revenue", "money"],
      ["monthlyCosts", "Monthly costs", "money"],
      ["monthlyProfit", "Estimated monthly profit before taxes", "money", true],
      ["profitPerDog", "Estimated profit per dog", "money"],
      ["dogsToPayOff", "Dogs to pay off equipment", "number"],
      ["monthsToPayOff", "Months to pay off equipment", "number"]
    ],
    calculate: (v) => {
      const monthlyDogs = v.dogsPerDay * v.workdaysPerMonth;
      const monthlyRevenue = v.averageGroomPrice * monthlyDogs;
      const monthlyCosts = (v.suppliesPerDog * monthlyDogs) + (v.fuelPerDay * v.workdaysPerMonth) + v.vanPayment + v.insuranceSoftware;
      const monthlyProfit = monthlyRevenue - monthlyCosts;
      const profitPerDog = divide(monthlyProfit, monthlyDogs);
      return { monthlyRevenue, monthlyCosts, monthlyProfit, profitPerDog, dogsToPayOff: divide(v.equipmentCost, profitPerDog), monthsToPayOff: divide(v.equipmentCost, monthlyProfit) };
    }
  },
radioConstruction: {
    fields: [
      ["startupEquipmentCost", "Startup equipment cost", 11000, "money"],
      ["trailerSetupCost", "Trailer or setup cost", 6000, "money"],
      ["sessionPrice", "Average session price", 5, "money"],
      ["sessionMinutes", "Session minutes", 5],
      ["sessionsPerEventDay", "Sessions per event day", 80],
      ["eventDaysPerMonth", "Event days per month", 8],
      ["privatePartyPrice", "Private party price", 399, "money"],
      ["privatePartiesPerMonth", "Private parties per month", 4],
      ["corporateEventPrice", "Corporate event price", 499, "money"],
      ["corporateEventsPerMonth", "Corporate events per month", 2],
      ["eventBoothFees", "Event booth fees per month", 800, "money"],
      ["monthlyMisc", "Monthly insurance/marketing/misc", 500, "money"],
      ["laborPerEventDay", "Labor cost per event day", 150, "money"]
    ],
    results: [
      ["sessionRevenue", "Monthly session revenue", "money"],
      ["partyRevenue", "Monthly private party revenue", "money"],
      ["corporateRevenue", "Monthly corporate event revenue", "money"],
      ["monthlyRevenue", "Total monthly revenue", "money"],
      ["monthlyExpenses", "Monthly expenses", "money"],
      ["monthlyProfit", "Estimated monthly profit", "money", true],
      ["annualProfit", "Annualized profit estimate", "money"],
      ["startupPaybackMonths", "Startup payback estimate in months", "number"]
    ],
    calculate: (v) => {
      const sessionRevenue = v.sessionPrice * v.sessionsPerEventDay * v.eventDaysPerMonth;
      const partyRevenue = v.privatePartyPrice * v.privatePartiesPerMonth;
      const corporateRevenue = v.corporateEventPrice * v.corporateEventsPerMonth;
      const monthlyRevenue = sessionRevenue + partyRevenue + corporateRevenue;
      const monthlyExpenses = v.eventBoothFees + v.monthlyMisc + (v.laborPerEventDay * v.eventDaysPerMonth);
      const monthlyProfit = monthlyRevenue - monthlyExpenses;
      const startupCost = v.startupEquipmentCost + v.trailerSetupCost;
      return { sessionRevenue, partyRevenue, corporateRevenue, monthlyRevenue, monthlyExpenses, monthlyProfit, annualProfit: monthlyProfit * 12, startupPaybackMonths: divide(startupCost, monthlyProfit) };
    }
  },
  saunaColdPlunge: {
    fields: [
      ["saunaStartupCost", "Sauna startup cost", 22000, "money"],
      ["additionalEquipment", "Second unit/additional equipment", 10000, "money"],
      ["averageRentalPrice", "Average rental price", 450, "money"],
      ["rentalsPerMonth", "Rentals per month", 12],
      ["weekendRentalPrice", "Weekend rental price", 650, "money"],
      ["weekendRentalsPerMonth", "Weekend rentals per month", 4],
      ["corporateHalfDayPrice", "Corporate half-day price", 1500, "money"],
      ["corporateEventsPerMonth", "Corporate events per month", 2],
      ["coldPlungeAddonPrice", "Cold plunge add-on price", 100, "money"],
      ["addonBookingsPerMonth", "Add-on bookings per month", 6],
      ["variableCostPerRental", "Wood/ice/fuel per rental", 40, "money"],
      ["insurance", "Insurance/month", 250, "money"],
      ["marketing", "Marketing/month", 300, "money"],
      ["storageMaintenance", "Storage/maintenance/month", 200, "money"]
    ],
    results: [
      ["privateRentalRevenue", "Monthly private rental revenue", "money"],
      ["weekendRevenue", "Monthly weekend rental revenue", "money"],
      ["corporateRevenue", "Monthly corporate event revenue", "money"],
      ["addonRevenue", "Monthly cold plunge add-on revenue", "money"],
      ["monthlyRevenue", "Total monthly revenue", "money"],
      ["monthlyExpenses", "Monthly expenses", "money"],
      ["monthlyProfit", "Estimated monthly profit", "money", true],
      ["annualProfit", "Annualized profit estimate", "money"],
      ["startupPaybackMonths", "Startup payback estimate in months", "number"]
    ],
    calculate: (v) => {
      const privateRentalRevenue = v.averageRentalPrice * v.rentalsPerMonth;
      const weekendRevenue = v.weekendRentalPrice * v.weekendRentalsPerMonth;
      const corporateRevenue = v.corporateHalfDayPrice * v.corporateEventsPerMonth;
      const addonRevenue = v.coldPlungeAddonPrice * v.addonBookingsPerMonth;
      const totalBookings = v.rentalsPerMonth + v.weekendRentalsPerMonth + v.corporateEventsPerMonth;
      const monthlyRevenue = privateRentalRevenue + weekendRevenue + corporateRevenue + addonRevenue;
      const monthlyExpenses = (v.variableCostPerRental * totalBookings) + v.insurance + v.marketing + v.storageMaintenance;
      const monthlyProfit = monthlyRevenue - monthlyExpenses;
      return { privateRentalRevenue, weekendRevenue, corporateRevenue, addonRevenue, monthlyRevenue, monthlyExpenses, monthlyProfit, annualProfit: monthlyProfit * 12, startupPaybackMonths: divide(v.saunaStartupCost + v.additionalEquipment, monthlyProfit) };
    }
  },
  parkingLotPizza: {
    fields: [
      ["pizzaOvenCost", "Pizza oven cost", 700, "money"],
      ["setupCost", "Canopy/table/setup cost", 300, "money"],
      ["averagePizzaPrice", "Average pizza price", 15, "money"],
      ["pizzasSoldPerDay", "Pizzas sold per day", 45],
      ["foodCostPerPizza", "Food cost per pizza", 4, "money"],
      ["sellingDaysPerMonth", "Selling days per month", 12],
      ["locationFeePerDay", "Location fee per day", 0, "money"],
      ["helperLaborPerDay", "Helper labor per day", 100, "money"],
      ["permitsInsurance", "Permits/insurance/month", 200, "money"],
      ["fuelPerDay", "Fuel/propane/wood per day", 40, "money"],
      ["marketingSignage", "Marketing/signage/month", 100, "money"]
    ],
    results: [
      ["monthlyRevenue", "Monthly pizza revenue", "money"],
      ["foodCosts", "Monthly food costs", "money"],
      ["monthlyExpenses", "Monthly expenses", "money"],
      ["monthlyProfit", "Estimated monthly profit", "money", true],
      ["annualProfit", "Annualized profit estimate", "money"],
      ["profitPerSellingDay", "Profit per selling day", "money"],
      ["startupPaybackMonths", "Startup payback estimate in months", "number"]
    ],
    calculate: (v) => {
      const monthlyPizzas = v.pizzasSoldPerDay * v.sellingDaysPerMonth;
      const monthlyRevenue = monthlyPizzas * v.averagePizzaPrice;
      const foodCosts = monthlyPizzas * v.foodCostPerPizza;
      const dailyCosts = (v.locationFeePerDay + v.helperLaborPerDay + v.fuelPerDay) * v.sellingDaysPerMonth;
      const monthlyExpenses = foodCosts + dailyCosts + v.permitsInsurance + v.marketingSignage;
      const monthlyProfit = monthlyRevenue - monthlyExpenses;
      return { monthlyRevenue, foodCosts, monthlyExpenses, monthlyProfit, annualProfit: monthlyProfit * 12, profitPerSellingDay: divide(monthlyProfit, v.sellingDaysPerMonth), startupPaybackMonths: divide(v.pizzaOvenCost + v.setupCost, monthlyProfit) };
    }
  },
  b2bStump: {
    fields: [
      ["averageFee", "Average stump grinding fee", 300, "money"],
      ["jobsPerWeek", "Jobs per week", 15],
      ["weeksPerMonth", "Weeks per month", 4.33],
      ["rentalCostPerDay", "Grinder rental cost per day", 250, "money"],
      ["rentalDaysPerMonth", "Rental days per month", 8],
      ["equipmentLoan", "Or equipment loan/month", 800, "money"],
      ["trailerTruck", "Trailer/truck cost per month", 500, "money"],
      ["fuelBladesMaintenance", "Fuel/blades/maintenance per job", 35, "money"],
      ["referralFee", "Referral fee per job", 50, "money"],
      ["insurance", "Insurance/month", 200, "money"],
      ["marketing", "Marketing/outreach/month", 150, "money"]
    ],
    results: [
      ["monthlyRevenue", "Monthly B2B revenue", "money"],
      ["jobCosts", "Monthly job costs", "money"],
      ["equipmentCosts", "Monthly rental or loan costs", "money"],
      ["monthlyExpenses", "Monthly expenses", "money"],
      ["monthlyProfit", "Estimated monthly profit", "money", true],
      ["annualProfit", "Annualized profit estimate", "money"],
      ["profitPerJob", "Estimated profit per job", "money"]
    ],
    calculate: (v) => {
      const monthlyJobs = v.jobsPerWeek * v.weeksPerMonth;
      const monthlyRevenue = monthlyJobs * v.averageFee;
      const jobCosts = monthlyJobs * (v.fuelBladesMaintenance + v.referralFee);
      const equipmentCosts = (v.rentalCostPerDay * v.rentalDaysPerMonth) + v.equipmentLoan + v.trailerTruck;
      const monthlyExpenses = jobCosts + equipmentCosts + v.insurance + v.marketing;
      const monthlyProfit = monthlyRevenue - monthlyExpenses;
      return { monthlyRevenue, jobCosts, equipmentCosts, monthlyExpenses, monthlyProfit, annualProfit: monthlyProfit * 12, profitPerJob: divide(monthlyProfit, monthlyJobs) };
    }
  },
  porchDecor: {
    fields: [
      ["averageJobPrice", "Average job price", 800, "money"],
      ["jobsPerSeason", "Jobs per season", 40],
      ["materialCostPerJob", "Material cost per job", 250, "money"],
      ["installLaborPerJob", "Install labor per job", 100, "money"],
      ["removalLaborPerJob", "Pickup/removal labor per job", 50, "money"],
      ["marketingPerMonth", "Marketing/month during season", 300, "money"],
      ["storagePerMonth", "Storage/month", 150, "money"],
      ["truckFuelPerJob", "Truck/fuel per job", 25, "money"],
      ["seasonMonths", "Season length in months", 2],
      ["repeatCustomerPercent", "Repeat customer percentage", 35, "percent"]
    ],
    results: [
      ["seasonRevenue", "Season revenue", "money"],
      ["seasonExpenses", "Season expenses", "money"],
      ["seasonProfit", "Estimated season profit", "money", true],
      ["monthlySeasonProfit", "Monthly profit during season", "money"],
      ["annualProfit", "Annualized profit estimate", "money"],
      ["repeatCustomers", "Estimated repeat customers", "number"],
      ["profitPerJob", "Estimated profit per job", "money"]
    ],
    calculate: (v) => {
      const seasonRevenue = v.averageJobPrice * v.jobsPerSeason;
      const perJobCosts = v.materialCostPerJob + v.installLaborPerJob + v.removalLaborPerJob + v.truckFuelPerJob;
      const seasonExpenses = (perJobCosts * v.jobsPerSeason) + ((v.marketingPerMonth + v.storagePerMonth) * v.seasonMonths);
      const seasonProfit = seasonRevenue - seasonExpenses;
      return { seasonRevenue, seasonExpenses, seasonProfit, monthlySeasonProfit: divide(seasonProfit, v.seasonMonths), annualProfit: seasonProfit, repeatCustomers: v.jobsPerSeason * (v.repeatCustomerPercent / 100), profitPerJob: divide(seasonProfit, v.jobsPerSeason) };
    }
  },
  washerDryerRental: {
    fields: [
      ["monthlyRentalPerSet", "Average monthly rental per set", 150, "money"],
      ["rentedSets", "Number of rented sets", 25],
      ["acquisitionCostPerSet", "Average acquisition cost per set", 250, "money"],
      ["deliveryInstallPerSet", "Delivery/install cost per set", 75, "money"],
      ["repairReservePerSet", "Monthly repair reserve per set", 15, "money"],
      ["storage", "Storage/month", 200, "money"],
      ["truckFuel", "Truck/fuel/month", 250, "money"],
      ["paymentProcessing", "Payment processing/month", 50, "money"],
      ["churnPercent", "Churn percentage per month", 5, "percent"],
      ["newSetsPerMonth", "New sets added per month", 5]
    ],
    results: [
      ["monthlyRevenue", "Monthly recurring revenue", "money"],
      ["repairReserve", "Monthly repair reserve", "money"],
      ["newSetInvestment", "Monthly new set investment", "money"],
      ["monthlyExpenses", "Monthly expenses", "money"],
      ["monthlyProfit", "Estimated monthly profit", "money", true],
      ["annualProfit", "Annualized profit estimate", "money"],
      ["churnedSets", "Estimated sets churned per month", "number"],
      ["startupPaybackMonths", "Startup payback estimate in months", "number"]
    ],
    calculate: (v) => {
      const monthlyRevenue = v.monthlyRentalPerSet * v.rentedSets;
      const repairReserve = v.repairReservePerSet * v.rentedSets;
      const newSetInvestment = (v.acquisitionCostPerSet + v.deliveryInstallPerSet) * v.newSetsPerMonth;
      const monthlyExpenses = repairReserve + v.storage + v.truckFuel + v.paymentProcessing + newSetInvestment;
      const monthlyProfit = monthlyRevenue - monthlyExpenses;
      const startupCost = (v.acquisitionCostPerSet + v.deliveryInstallPerSet) * v.rentedSets;
      return { monthlyRevenue, repairReserve, newSetInvestment, monthlyExpenses, monthlyProfit, annualProfit: monthlyProfit * 12, churnedSets: v.rentedSets * (v.churnPercent / 100), startupPaybackMonths: divide(startupCost, monthlyProfit) };
    }
  },
  coilCleaning: {
    fields: [
      ["averagePrice", "Average coil cleaning price", 250, "money"],
      ["jobsPerWeek", "Jobs per week", 20],
      ["weeksPerMonth", "Weeks per month", 4.33],
      ["suppliesPerJob", "Chemical/supplies per job", 20, "money"],
      ["laborPerJob", "Labor cost per job", 75, "money"],
      ["travelPerJob", "Travel/fuel per job", 15, "money"],
      ["equipmentCost", "Equipment cost", 3000, "money"],
      ["insurance", "Insurance/month", 250, "money"],
      ["marketing", "Marketing/outreach/month", 300, "money"],
      ["recurringContracts", "Recurring contracts per month", 10]
    ],
    results: [
      ["monthlyRevenue", "Monthly coil cleaning revenue", "money"],
      ["recurringContractValue", "Recurring contract planning value", "money"],
      ["jobCosts", "Monthly job costs", "money"],
      ["monthlyExpenses", "Monthly expenses", "money"],
      ["monthlyProfit", "Estimated monthly profit", "money", true],
      ["annualProfit", "Annualized profit estimate", "money"],
      ["startupPaybackMonths", "Equipment payback estimate in months", "number"]
    ],
    calculate: (v) => {
      const monthlyJobs = v.jobsPerWeek * v.weeksPerMonth;
      const monthlyRevenue = monthlyJobs * v.averagePrice;
      const recurringContractValue = v.recurringContracts * v.averagePrice;
      const jobCosts = monthlyJobs * (v.suppliesPerJob + v.laborPerJob + v.travelPerJob);
      const monthlyExpenses = jobCosts + v.insurance + v.marketing;
      const monthlyProfit = monthlyRevenue - monthlyExpenses;
      return { monthlyRevenue, recurringContractValue, jobCosts, monthlyExpenses, monthlyProfit, annualProfit: monthlyProfit * 12, startupPaybackMonths: divide(v.equipmentCost, monthlyProfit) };
    }
  },
  mailboxRepair: {
    fields: [
      ["averageRepairPrice", "Average repair price", 200, "money"],
      ["averageInstallPrice", "Average new install price", 450, "money"],
      ["repairJobsPerMonth", "Repair jobs per month", 20],
      ["newInstallsPerMonth", "New installs per month", 10],
      ["materialRepair", "Material cost per repair", 40, "money"],
      ["materialInstall", "Material cost per install", 100, "money"],
      ["hoaProjectValue", "HOA project value", 5000, "money"],
      ["hoaProjectsPerYear", "HOA projects per year", 2],
      ["flyers", "Flyers/door hangers/month", 150, "money"],
      ["tools", "Tools/equipment cost", 500, "money"],
      ["fuel", "Fuel/month", 150, "money"],
      ["insurance", "Insurance/month", 150, "money"],
      ["callbackReserve", "Callback reserve percentage", 5, "percent"]
    ],
    results: [
      ["repairRevenue", "Monthly repair revenue", "money"],
      ["installRevenue", "Monthly install revenue", "money"],
      ["hoaMonthlyRevenue", "Monthly HOA project value", "money"],
      ["monthlyRevenue", "Total monthly revenue", "money"],
      ["monthlyExpenses", "Monthly expenses", "money"],
      ["monthlyProfit", "Estimated monthly profit", "money", true],
      ["annualProfit", "Annualized profit estimate", "money"],
      ["startupPaybackMonths", "Tool payback estimate in months", "number"]
    ],
    calculate: (v) => {
      const repairRevenue = v.averageRepairPrice * v.repairJobsPerMonth;
      const installRevenue = v.averageInstallPrice * v.newInstallsPerMonth;
      const hoaMonthlyRevenue = divide(v.hoaProjectValue * v.hoaProjectsPerYear, 12);
      const monthlyRevenue = repairRevenue + installRevenue + hoaMonthlyRevenue;
      const materials = (v.materialRepair * v.repairJobsPerMonth) + (v.materialInstall * v.newInstallsPerMonth);
      const callbackCost = monthlyRevenue * (v.callbackReserve / 100);
      const monthlyExpenses = materials + callbackCost + v.flyers + v.fuel + v.insurance;
      const monthlyProfit = monthlyRevenue - monthlyExpenses;
      return { repairRevenue, installRevenue, hoaMonthlyRevenue, monthlyRevenue, monthlyExpenses, monthlyProfit, annualProfit: monthlyProfit * 12, startupPaybackMonths: divide(v.tools, monthlyProfit) };
    }
  },
  droneRoofDocs: {
    fields: [
      ["residentialFee", "Residential documentation fee", 300, "money"],
      ["commercialFee", "Commercial documentation fee", 600, "money"],
      ["residentialJobs", "Residential jobs per month", 20],
      ["commercialJobs", "Commercial jobs per month", 8],
      ["droneCost", "Drone cost", 2500, "money"],
      ["trainingCost", "FAA Part 107/training cost", 300, "money"],
      ["insurance", "Insurance/month", 150, "money"],
      ["software", "Software/reporting/month", 100, "money"],
      ["travelPerJob", "Travel/fuel per job", 20, "money"],
      ["editingHours", "Editing/report time per job hours", 1],
      ["referralFeePercent", "Referral fee percentage", 20, "percent"],
      ["googleAds", "Google Ads/month", 400, "money"],
      ["leadCloseRate", "Lead close rate percentage", 40, "percent"]
    ],
    results: [
      ["residentialRevenue", "Residential documentation revenue", "money"],
      ["commercialRevenue", "Commercial documentation revenue", "money"],
      ["monthlyRevenue", "Total monthly revenue", "money"],
      ["referralFees", "Estimated referral fees", "money"],
      ["monthlyExpenses", "Monthly expenses", "money"],
      ["monthlyProfit", "Estimated monthly profit", "money", true],
      ["annualProfit", "Annualized profit estimate", "money"],
      ["startupPaybackMonths", "Drone/training payback estimate in months", "number"]
    ],
    calculate: (v) => {
      const totalJobs = v.residentialJobs + v.commercialJobs;
      const residentialRevenue = v.residentialFee * v.residentialJobs;
      const commercialRevenue = v.commercialFee * v.commercialJobs;
      const monthlyRevenue = residentialRevenue + commercialRevenue;
      const referralFees = monthlyRevenue * (v.referralFeePercent / 100);
      const monthlyExpenses = referralFees + v.insurance + v.software + v.googleAds + (v.travelPerJob * totalJobs);
      const monthlyProfit = monthlyRevenue - monthlyExpenses;
      return { residentialRevenue, commercialRevenue, monthlyRevenue, referralFees, monthlyExpenses, monthlyProfit, annualProfit: monthlyProfit * 12, startupPaybackMonths: divide(v.droneCost + v.trainingCost, monthlyProfit) };
    }
  },
  dumpTrailer: {
    fields: [
      ["dailyRate", "Rental price per day", 225, "money"], ["averageDays", "Average rental length in days", 3],
      ["rentalsPerMonth", "Rentals per month", 8], ["deliveryFee", "Delivery and pickup fee", 125, "money"],
      ["dumpCost", "Dump and disposal cost per rental", 110, "money"], ["fuelCost", "Delivery fuel per rental", 45, "money"],
      ["cleaningRepair", "Cleaning and repair reserve per rental", 35, "money"], ["insurance", "Monthly insurance", 180, "money"],
      ["storage", "Monthly storage", 175, "money"], ["financing", "Monthly trailer payment", 450, "money"],
      ["marketing", "Monthly marketing and software", 300, "money"], ["startupCost", "Trailer and startup investment", 15000, "money"]
    ],
    results: [["monthlyRevenue", "Monthly rental revenue", "money"], ["monthlyExpenses", "Monthly operating expenses", "money"], ["monthlyProfit", "Estimated monthly profit", "money", true], ["profitPerRental", "Profit per rental", "money"], ["profitMargin", "Profit margin percent", "number"], ["breakEvenRentals", "Break-even rentals per month", "number"], ["paybackMonths", "Startup payback in months", "number"]],
    calculate: (v) => { const revenuePerRental = v.dailyRate * v.averageDays + v.deliveryFee; const variablePerRental = v.dumpCost + v.fuelCost + v.cleaningRepair; const fixed = v.insurance + v.storage + v.financing + v.marketing; const monthlyRevenue = revenuePerRental * v.rentalsPerMonth; const monthlyExpenses = variablePerRental * v.rentalsPerMonth + fixed; const monthlyProfit = monthlyRevenue - monthlyExpenses; const contribution = revenuePerRental - variablePerRental; return { monthlyRevenue, monthlyExpenses, monthlyProfit, profitPerRental: contribution - divide(fixed, v.rentalsPerMonth), profitMargin: divide(monthlyProfit, monthlyRevenue) * 100, breakEvenRentals: divide(fixed, contribution), paybackMonths: divide(v.startupCost, monthlyProfit) }; }
  },
  sprinklerInstall: {
    fields: [["averagePrice", "Average installation price", 6500, "money"], ["installs", "Installations per month", 4], ["materials", "Heads, valves, controller and pipe per job", 2300, "money"], ["laborHours", "Crew labor hours per job", 40], ["laborRate", "Loaded labor cost per hour", 35, "money"], ["trenching", "Trenching and equipment per job", 300, "money"], ["travelPermit", "Travel and permits per job", 200, "money"], ["repairRevenue", "Monthly repair and maintenance revenue", 1800, "money"], ["repairCost", "Monthly repair direct costs", 650, "money"], ["overhead", "Monthly overhead and marketing", 1800, "money"], ["startupCost", "Startup equipment investment", 18000, "money"]],
    results: [["monthlyRevenue", "Total monthly revenue", "money"], ["monthlyExpenses", "Monthly costs", "money"], ["monthlyProfit", "Estimated monthly profit", "money", true], ["profitPerInstall", "Profit per installation", "money"], ["profitMargin", "Profit margin percent", "number"], ["breakEvenInstalls", "Break-even installs per month", "number"], ["paybackMonths", "Startup payback in months", "number"]],
    calculate: (v) => { const variable = v.materials + v.laborHours * v.laborRate + v.trenching + v.travelPermit; const monthlyRevenue = v.averagePrice * v.installs + v.repairRevenue; const monthlyExpenses = variable * v.installs + v.repairCost + v.overhead; const monthlyProfit = monthlyRevenue - monthlyExpenses; const contribution = v.averagePrice - variable; return { monthlyRevenue, monthlyExpenses, monthlyProfit, profitPerInstall: contribution - divide(v.overhead + v.repairCost - v.repairRevenue, v.installs), profitMargin: divide(monthlyProfit, monthlyRevenue) * 100, breakEvenInstalls: divide(Math.max(0, v.overhead + v.repairCost - v.repairRevenue), contribution), paybackMonths: divide(v.startupCost, monthlyProfit) }; }
  },
  bathroomRemodel: {
    fields: [["contractPrice", "What you plan to charge per bathroom", 18000, "money"], ["projects", "Projects completed per month", 2], ["demolition", "Demolition and disposal per project", 900, "money"], ["materials", "Tile, fixtures and cabinetry per project", 6500, "money"], ["trades", "Plumbing, electrical and subcontractors", 2800, "money"], ["labor", "Crew labor per project", 2800, "money"], ["permits", "Permits and inspections per project", 350, "money"], ["callbackPercent", "Warranty and callback reserve percent", 3, "percent"], ["overhead", "Monthly overhead and marketing", 2500, "money"], ["startupCost", "Tools and startup investment", 22000, "money"]],
    results: [["monthlyRevenue", "Total customer charges this month", "money"], ["monthlyExpenses", "Job costs plus monthly overhead", "money"], ["monthlyProfit", "Estimated monthly profit before tax", "money", true], ["profitPerProject", "Profit per project after overhead", "money"], ["profitMargin", "Profit margin percent", "number"], ["breakEvenProjects", "Break-even projects per month", "number"], ["paybackMonths", "Startup payback in months", "number"]],
    calculate: (v) => { const callback = v.contractPrice * v.callbackPercent / 100; const variable = v.demolition + v.materials + v.trades + v.labor + v.permits + callback; const monthlyRevenue = v.contractPrice * v.projects; const monthlyExpenses = variable * v.projects + v.overhead; const monthlyProfit = monthlyRevenue - monthlyExpenses; const contribution = v.contractPrice - variable; return { monthlyRevenue, monthlyExpenses, monthlyProfit, profitPerProject: contribution - divide(v.overhead, v.projects), profitMargin: divide(monthlyProfit, monthlyRevenue) * 100, breakEvenProjects: divide(v.overhead, contribution), paybackMonths: divide(v.startupCost, monthlyProfit) }; }
  },
  gutterInstall: {
    fields: [["linearFeet", "Average linear feet per job", 180], ["pricePerFoot", "Installed price per linear foot", 12, "money"], ["addonRevenue", "Downspout and guard revenue per job", 450, "money"], ["materialPerFoot", "Gutter material cost per foot", 4.5, "money"], ["addonCost", "Downspout and guard cost per job", 180, "money"], ["laborHours", "Crew labor hours per job", 24], ["laborRate", "Loaded labor cost per hour", 32, "money"], ["travelSupplies", "Travel, hangers and supplies per job", 170, "money"], ["jobs", "Jobs per month", 6], ["overhead", "Monthly overhead and marketing", 2200, "money"], ["startupCost", "Machine, ladders and startup investment", 26000, "money"]],
    results: [["monthlyRevenue", "Monthly installation revenue", "money"], ["monthlyExpenses", "Monthly costs", "money"], ["monthlyProfit", "Estimated monthly profit", "money", true], ["profitPerJob", "Profit per job", "money"], ["profitMargin", "Profit margin percent", "number"], ["breakEvenJobs", "Break-even jobs per month", "number"], ["paybackMonths", "Startup payback in months", "number"]],
    calculate: (v) => { const revenuePerJob = v.linearFeet * v.pricePerFoot + v.addonRevenue; const variable = v.linearFeet * v.materialPerFoot + v.addonCost + v.laborHours * v.laborRate + v.travelSupplies; const monthlyRevenue = revenuePerJob * v.jobs; const monthlyExpenses = variable * v.jobs + v.overhead; const monthlyProfit = monthlyRevenue - monthlyExpenses; const contribution = revenuePerJob - variable; return { monthlyRevenue, monthlyExpenses, monthlyProfit, profitPerJob: contribution - divide(v.overhead, v.jobs), profitMargin: divide(monthlyProfit, monthlyRevenue) * 100, breakEvenJobs: divide(v.overhead, contribution), paybackMonths: divide(v.startupCost, monthlyProfit) }; }
  },
  awningInstall: {
    fields: [["projectPrice", "Average awning project price", 4200, "money"], ["jobs", "Installations per month", 4], ["fabricFrame", "Fabric and frame per project", 1800, "money"], ["motorControls", "Motor and controls per project", 400, "money"], ["laborHours", "Installation labor hours", 18], ["laborRate", "Loaded labor cost per hour", 35, "money"], ["delivery", "Delivery and travel per project", 120, "money"], ["permitsEquipment", "Permits and equipment per project", 150, "money"], ["overhead", "Monthly overhead and marketing", 1700, "money"], ["startupCost", "Tools and startup investment", 18000, "money"]],
    results: [["monthlyRevenue", "Monthly installation revenue", "money"], ["monthlyExpenses", "Monthly costs", "money"], ["monthlyProfit", "Estimated monthly profit", "money", true], ["profitPerJob", "Profit per job", "money"], ["profitMargin", "Profit margin percent", "number"], ["breakEvenJobs", "Break-even jobs per month", "number"], ["paybackMonths", "Startup payback in months", "number"]],
    calculate: (v) => { const variable = v.fabricFrame + v.motorControls + v.laborHours * v.laborRate + v.delivery + v.permitsEquipment; const monthlyRevenue = v.projectPrice * v.jobs; const monthlyExpenses = variable * v.jobs + v.overhead; const monthlyProfit = monthlyRevenue - monthlyExpenses; const contribution = v.projectPrice - variable; return { monthlyRevenue, monthlyExpenses, monthlyProfit, profitPerJob: contribution - divide(v.overhead, v.jobs), profitMargin: divide(monthlyProfit, monthlyRevenue) * 100, breakEvenJobs: divide(v.overhead, contribution), paybackMonths: divide(v.startupCost, monthlyProfit) }; }
  },
  shedInstall: {
    fields: [["projectPrice", "Average installed shed price", 6500, "money"], ["jobs", "Installations per month", 3], ["shedMaterials", "Shed kit or materials per project", 3200, "money"], ["foundation", "Foundation per project", 700, "money"], ["delivery", "Delivery per project", 250, "money"], ["laborHours", "Assembly labor hours", 32], ["laborRate", "Loaded labor cost per hour", 32, "money"], ["sitePermit", "Site preparation and permits", 250, "money"], ["overhead", "Monthly overhead and marketing", 1600, "money"], ["startupCost", "Truck, tools and startup investment", 24000, "money"]],
    results: [["monthlyRevenue", "Monthly shed revenue", "money"], ["monthlyExpenses", "Monthly costs", "money"], ["monthlyProfit", "Estimated monthly profit", "money", true], ["profitPerJob", "Profit per installation", "money"], ["profitMargin", "Profit margin percent", "number"], ["breakEvenJobs", "Break-even jobs per month", "number"], ["paybackMonths", "Startup payback in months", "number"]],
    calculate: (v) => { const variable = v.shedMaterials + v.foundation + v.delivery + v.laborHours * v.laborRate + v.sitePermit; const monthlyRevenue = v.projectPrice * v.jobs; const monthlyExpenses = variable * v.jobs + v.overhead; const monthlyProfit = monthlyRevenue - monthlyExpenses; const contribution = v.projectPrice - variable; return { monthlyRevenue, monthlyExpenses, monthlyProfit, profitPerJob: contribution - divide(v.overhead, v.jobs), profitMargin: divide(monthlyProfit, monthlyRevenue) * 100, breakEvenJobs: divide(v.overhead, contribution), paybackMonths: divide(v.startupCost, monthlyProfit) }; }
  },
  aquariumInstall: {
    fields: [["projectPrice", "Average custom aquarium project price", 25000, "money"], ["projects", "Projects completed per month", 1.5], ["designFee", "Design fee charged per project", 1500, "money"], ["fabrication", "Tank fabrication per project", 7000, "money"], ["cabinetry", "Stand and cabinetry per project", 2500, "money"], ["equipment", "Filtration, lighting and plumbing", 3500, "money"], ["delivery", "Delivery per project", 800, "money"], ["laborHours", "Design and installation labor hours", 80], ["laborRate", "Loaded labor cost per hour", 45, "money"], ["aquascaping", "Aquascaping allowance per project", 1500, "money"], ["maintenanceClients", "Monthly maintenance clients", 8], ["maintenanceFee", "Monthly maintenance fee per client", 450, "money"], ["maintenanceCost", "Monthly maintenance cost per client", 180, "money"], ["overhead", "Monthly overhead and marketing", 3500, "money"], ["startupCost", "Tools, vehicle and inventory investment", 45000, "money"]],
    results: [["monthlyRevenue", "Total monthly revenue", "money"], ["monthlyExpenses", "Monthly costs", "money"], ["monthlyProfit", "Estimated monthly profit", "money", true], ["profitPerProject", "Profit per project before fixed overhead", "money"], ["maintenanceProfit", "Monthly maintenance contribution", "money"], ["profitMargin", "Profit margin percent", "number"], ["paybackMonths", "Startup payback in months", "number"]],
    calculate: (v) => { const projectRevenue = v.projectPrice + v.designFee; const projectCost = v.fabrication + v.cabinetry + v.equipment + v.delivery + v.laborHours * v.laborRate + v.aquascaping; const maintenanceRevenue = v.maintenanceClients * v.maintenanceFee; const maintenanceProfit = v.maintenanceClients * (v.maintenanceFee - v.maintenanceCost); const monthlyRevenue = projectRevenue * v.projects + maintenanceRevenue; const monthlyExpenses = projectCost * v.projects + v.maintenanceClients * v.maintenanceCost + v.overhead; const monthlyProfit = monthlyRevenue - monthlyExpenses; return { monthlyRevenue, monthlyExpenses, monthlyProfit, profitPerProject: projectRevenue - projectCost, maintenanceProfit, profitMargin: divide(monthlyProfit, monthlyRevenue) * 100, paybackMonths: divide(v.startupCost, monthlyProfit) }; }
  },
  homeStaging: {
    fields: [["stagingFee", "Average initial staging fee", 3200, "money"], ["projects", "New staging projects per month", 4], ["extensionHomes", "Homes paying monthly extensions", 3], ["extensionFee", "Monthly extension fee per home", 500, "money"], ["deliveryPickup", "Delivery and pickup per project", 450, "money"], ["laborHours", "Design, setup and teardown hours", 20], ["laborRate", "Loaded labor cost per hour", 30, "money"], ["cleaningDamage", "Cleaning and damage reserve per project", 150, "money"], ["storage", "Warehouse and storage per month", 1800, "money"], ["truckFuel", "Truck, fuel and insurance per month", 1200, "money"], ["marketing", "Marketing, software and overhead", 1000, "money"], ["inventoryCost", "Furniture and décor inventory investment", 80000, "money"]],
    results: [["monthlyRevenue", "Total monthly revenue", "money"], ["monthlyExpenses", "Monthly operating expenses", "money"], ["monthlyProfit", "Estimated monthly profit", "money", true], ["profitPerProject", "Profit per new staging project", "money"], ["extensionRevenue", "Monthly extension revenue", "money"], ["profitMargin", "Profit margin percent", "number"], ["breakEvenProjects", "Break-even new projects per month", "number"], ["paybackMonths", "Inventory payback in months", "number"]],
    calculate: (v) => { const variable = v.deliveryPickup + v.laborHours * v.laborRate + v.cleaningDamage; const fixed = v.storage + v.truckFuel + v.marketing; const extensionRevenue = v.extensionHomes * v.extensionFee; const monthlyRevenue = v.stagingFee * v.projects + extensionRevenue; const monthlyExpenses = variable * v.projects + fixed; const monthlyProfit = monthlyRevenue - monthlyExpenses; const contribution = v.stagingFee - variable; return { monthlyRevenue, monthlyExpenses, monthlyProfit, profitPerProject: contribution - divide(fixed - extensionRevenue, v.projects), extensionRevenue, profitMargin: divide(monthlyProfit, monthlyRevenue) * 100, breakEvenProjects: divide(Math.max(0, fixed - extensionRevenue), contribution), paybackMonths: divide(v.inventoryCost, monthlyProfit) }; }
  },
  grillCleaning: {
    fields: [
      ["averagePrice", "Average grill cleaning price", 225, "money"],
      ["jobsPerDay", "Jobs per day", 2],
      ["daysPerWeek", "Days worked per week", 5],
      ["seasonMonths", "Season length in months", 6],
      ["suppliesPerJob", "Supplies cost per job", 15, "money"],
      ["travelPerJob", "Travel/fuel per job", 15, "money"],
      ["helperLaborPerJob", "Helper labor per job", 0, "money"],
      ["marketing", "Marketing/flyers/month", 250, "money"],
      ["insurance", "Insurance/month", 100, "money"],
      ["upsellRevenuePerJob", "Upsell revenue per job", 30, "money"],
      ["repeatCleanings", "Repeat cleanings per customer per year", 1]
    ],
    results: [
      ["monthlyRevenue", "Monthly grill cleaning revenue", "money"],
      ["upsellRevenue", "Monthly upsell revenue", "money"],
      ["monthlyExpenses", "Monthly expenses", "money"],
      ["monthlyProfit", "Estimated monthly profit", "money", true],
      ["seasonProfit", "Estimated season profit", "money"],
      ["annualProfit", "Annualized seasonal profit", "money"],
      ["profitPerJob", "Estimated profit per job", "money"]
    ],
    calculate: (v) => {
      const monthlyJobs = v.jobsPerDay * v.daysPerWeek * 4.33;
      const baseRevenue = monthlyJobs * v.averagePrice;
      const upsellRevenue = monthlyJobs * v.upsellRevenuePerJob;
      const monthlyRevenue = baseRevenue + upsellRevenue;
      const monthlyExpenses = (monthlyJobs * (v.suppliesPerJob + v.travelPerJob + v.helperLaborPerJob)) + v.marketing + v.insurance;
      const monthlyProfit = monthlyRevenue - monthlyExpenses;
      return { monthlyRevenue, upsellRevenue, monthlyExpenses, monthlyProfit, seasonProfit: monthlyProfit * v.seasonMonths, annualProfit: monthlyProfit * v.seasonMonths, profitPerJob: divide(monthlyProfit, monthlyJobs) };
    }
  }
};

function divide(a, b) {
  return b > 0 ? a / b : 0;
}

function cleanNumber(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function format(value, type) {
  if (!Number.isFinite(value)) return type === "money" ? MONEY.format(0) : "0";
  if (type === "money") return MONEY.format(value);
  return NUMBER.format(value);
}

function initCalculator() {
  const root = document.querySelector("[data-calculator]");
  if (!root) return;

  const key = root.dataset.calculator;
  const config = calculators[key];
  if (!config) return;

  const form = document.querySelector("[data-calculator-form]");
  const results = document.querySelector("[data-calculator-results]");

  form.innerHTML = config.fields.map(([id, label, value, type]) => `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" name="${id}" type="number" min="0" step="${type === "percent" ? "1" : "0.01"}" value="${value}" inputmode="decimal" />
    </div>
  `).join("");

  results.innerHTML = config.results.map(([id, label, type, featured]) => `
    <div class="result-row${featured ? " featured" : ""}">
      <span>${label}</span>
      <strong data-result="${id}" data-type="${type}">0</strong>
    </div>
  `).join("");

  function calculate() {
    const values = {};
    config.fields.forEach(([id]) => {
      values[id] = cleanNumber(form.elements[id].value);
    });

    const calculated = config.calculate(values);
    Object.entries(calculated).forEach(([id, value]) => {
      const node = results.querySelector(`[data-result="${id}"]`);
      if (node) node.textContent = format(value, node.dataset.type);
    });
  }

  form.addEventListener("input", calculate);
  calculate();
}

initCalculator();
