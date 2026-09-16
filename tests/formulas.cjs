const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ctx = { document: { querySelector: () => null } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8') + '\nthis.configs = calculators;', ctx);
const configs = ctx.configs;
const defaults = key => Object.fromEntries(configs[key].fields.map(([id, label, value]) => [id, value]));
const calc = (key, values = {}) => configs[key].calculate({ ...defaults(key), ...values });
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
let checks = 0;
for (const [key, cfg] of Object.entries(configs)) {
  const result = calc(key);
  for (const [id] of cfg.results) {
    assert.ok(id in result, `${key}.${id} missing`);
    assert.ok(Number.isFinite(result[id]), `${key}.${id} has invalid default`);
    checks++;
  }
  const zero = cfg.calculate(Object.fromEntries(cfg.fields.map(([id]) => [id, 0])));
  assert.ok(Object.values(zero).every(v => typeof v === 'number' && v !== Infinity && v !== -Infinity));
}
// Equipment: $1,200 purchase, $100 per job, 3 jobs/week = $1,300 monthly
// contribution less $100 recurring costs = $1,200. Payback is one month.
const equip = calc('equipment', { equipmentCost: 1200, profitPerJob: 100, jobsPerWeek: 3, extraMonthlyCosts: 100 });
near(equip.monthlyNetProfit, 1200); near(equip.weeksNeeded, 52 / 12); near(equip.jobsNeeded, 13);
assert.ok(Number.isNaN(calc('equipment', { extraMonthlyCosts: 99999 }).weeksNeeded));
assert.ok(Number.isNaN(calc('equipment', { jobsPerWeek: 0 }).weeksNeeded));
near(calc('equipment', { equipmentCost: 0 }).weeksNeeded, 0);
near(calc('foodtruck').monthlySalesNeeded, 88500 / 12);
assert.equal(calc('pestStartup').customersNeeded, 90);
assert.equal(calc('pestStartup', { customerProfit: 50 }).customersNeeded, 45);
assert.ok(Number.isNaN(calc('pestStartup', { customerProfit: 0 }).customersNeeded));
assert.equal(calc('b2bStump').equipmentCosts, 2500);
const rental = calc('washerDryerRental');
assert.equal(rental.monthlyProfit, 2875); assert.equal(rental.cashAfterGrowth, 1250);
assert.equal(calc('washerDryerRental', { newSetsPerMonth: 0 }).monthlyProfit, rental.monthlyProfit);
assert.equal(calc('droneRoofDocs', { editingRate: 0 }).monthlyProfit - calc('droneRoofDocs').monthlyProfit, 840);
assert.equal(calc('droneRoofDocs').leadsNeeded, 70);
for (const key of ['houseCleaning','carpetCleaning','dryerVentCleaning','poolCleaning','trashBinCleaning','solarPanelCleaning']) {
  const d = defaults(key), result = calc(key), zero = calc(key, { jobs: 0 });
  near(result.ownerCash - result.laborAllowance, result.monthlyProfit);
  near(result.monthlyRevenue - result.monthlyCosts, result.ownerCash);
  assert.equal(zero.monthlyRevenue, 0);
  assert.equal(zero.ownerCash, -d.overhead - d.paidLabor);
  assert.ok(Number.isNaN(zero.paybackMonths));
  assert.ok(Number.isNaN(calc(key, { price: 0 }).breakEvenJobs));
  assert.ok(Number.isNaN(calc(key, { price: 0 }).paybackMonths));
  assert.equal(calc(key, { startup: 0, jobs: 0 }).paybackMonths, 0);
  assert.equal(calc(key, { hours: 0 }).laborAllowance, 0);
  assert.ok(Number.isNaN(calc(key, { hours: 0 }).ownerHourly));
  assert.equal(calc(key, { ownerRate: 0 }).monthlyProfit, result.ownerCash);
  checks += 11;
}
near(calc('houseCleaning').monthlyRevenue, 4320);
near(calc('houseCleaning').ownerCash, 3370);
near(calc('houseCleaning').monthlyProfit, 1270);
near(calc('carpetCleaning').monthlyProfit, 1330);
near(calc('dryerVentCleaning').monthlyProfit, 1604);
near(calc('poolCleaning', { visits: 4 }).monthlyProfit, 1480);
near(calc('trashBinCleaning').monthlyProfit, 1350);
near(calc('solarPanelCleaning').monthlyProfit, 1390);
// Pool monthly billing must stay fixed when weekly visit count changes.
assert.equal(calc('poolCleaning', { visits: 5 }).monthlyRevenue, calc('poolCleaning', { visits: 4 }).monthlyRevenue);
console.log(`PASS: ${Object.keys(configs).length} calculator configurations; ${checks}+ default, accounting and edge-case assertions.`);
