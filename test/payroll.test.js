import { test } from 'node:test';
import assert from 'node:assert/strict';
import { annualTax, computePay, pagibig, philhealth, sss, sssMsc, thirteenthMonth, withholdingTax } from '../src/payroll.js';

test('SSS: salary credit steps, floor and ceiling', () => {
  assert.equal(sssMsc(4000), 5000);
  assert.equal(sssMsc(5249.99), 5000);
  assert.equal(sssMsc(5250), 5500);
  assert.equal(sssMsc(20000), 20000);
  assert.equal(sssMsc(34750), 35000);
  assert.equal(sssMsc(90000), 35000);
  assert.deepEqual(sss(35000), { msc: 35000, regular_msc: 20000, mpf_msc: 15000, employee: 1750, employer: 3500, ec: 30, total: 5280 });
  assert.equal(sss(5000).employee, 250);
  assert.equal(sss(14000).ec, 10);
});

test('PhilHealth: 5% between ₱10,000 and ₱100,000, shared equally', () => {
  assert.deepEqual(philhealth(8000), { base: 10000, premium: 500, employee: 250, employer: 250 });
  assert.deepEqual(philhealth(35000), { base: 35000, premium: 1750, employee: 875, employer: 875 });
  assert.deepEqual(philhealth(150000), { base: 100000, premium: 5000, employee: 2500, employer: 2500 });
});

test('Pag-IBIG: 2% up to ₱10,000, 1% for ₱1,500 or less', () => {
  assert.deepEqual(pagibig(35000), { base: 10000, employee: 200, employer: 200 });
  assert.deepEqual(pagibig(1500), { base: 1500, employee: 15, employer: 30 });
});

test('withholding tax: BIR 2023 tables', () => {
  assert.equal(withholdingTax(20832), 0);
  assert.equal(withholdingTax(33333), 1875);
  assert.equal(withholdingTax(32175), 1701.3);
  assert.equal(withholdingTax(100000), 16875.05);
  assert.equal(withholdingTax(16666, 'semi-monthly'), 937.35);
  assert.equal(annualTax(250000), 0);
  assert.equal(annualTax(400000), 22500);
  assert.equal(annualTax(1000000), 152500);
});

test('a ₱35,000 monthly salary', () => {
  const p = computePay({ monthlyBasic: 35000 });
  assert.equal(p.contributions.employee_total, 2825);
  assert.equal(p.taxable, 32175);
  assert.equal(p.withholding_tax, 1701.3);
  assert.equal(p.net_pay, 30473.7);
  assert.equal(p.employer_cost, 35000 + 3500 + 30 + 875 + 200);
});

test('semi-monthly splits contributions and uses the semi-monthly table', () => {
  const p = computePay({ monthlyBasic: 35000, frequency: 'semi-monthly' });
  assert.equal(p.gross, 17500);
  assert.equal(p.contributions.employee_total, 1412.5);
  assert.equal(p.taxable, 16087.5);
  assert.equal(p.withholding_tax, withholdingTax(16087.5, 'semi-monthly'));
});

test('minimum wage earners pay no income tax; de minimis is not taxed', () => {
  assert.equal(computePay({ monthlyBasic: 15000, minimumWageEarner: true }).withholding_tax, 0);
  const a = computePay({ monthlyBasic: 30000 }), b = computePay({ monthlyBasic: 30000, nonTaxable: 2000 });
  assert.equal(b.withholding_tax, a.withholding_tax);
  assert.equal(b.net_pay, a.net_pay + 2000);
});

test('13th month pay is tax-free up to ₱90,000 with other benefits', () => {
  assert.deepEqual(thirteenthMonth(420000), { pay: 35000, taxable_excess: 0 });
  assert.deepEqual(thirteenthMonth(1200000, 10000), { pay: 100000, taxable_excess: 20000 });
});
