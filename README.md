# rdcruz-ph-payroll

**Philippine payroll in one small library**: SSS, PhilHealth and Pag-IBIG contributions, BIR withholding tax, net pay, the employer's total cost, and 13th month pay, at **2026 rates**. No dependencies; works in Node and in the browser.

Try it: [Sweldo Calculator on rdcruz.com](https://rdcruz.com/tools/payroll).

```js
import { computePay } from 'rdcruz-ph-payroll';

computePay({ monthlyBasic: 35000 });
// {
//   gross: 35000,
//   contributions: {
//     sss:        { msc: 35000, employee: 1750, employer: 3500, ec: 30, mpf_msc: 15000 },
//     philhealth: { base: 35000, employee: 875, employer: 875 },
//     pagibig:    { base: 10000, employee: 200, employer: 200 },
//     employee_total: 2825, employer_total: 4605
//   },
//   taxable: 32175, withholding_tax: 1701.3,
//   net_pay: 30473.7, employer_cost: 39605
// }
```

## What it covers

| | Rule used |
|---|---|
| **SSS** | 15% of the Monthly Salary Credit: employee 5%, employer 10%. The MSC runs from ₱5,000 to ₱35,000 in ₱500 steps (rounded to the nearest step). The part above ₱20,000 goes to the Mandatory Provident Fund (MySSS Pension Booster). Employees' Compensation: ₱10 below an MSC of ₱15,000, ₱30 from ₱15,000 (employer) |
| **PhilHealth** | 5% of the monthly basic salary, with a floor of ₱10,000 and a ceiling of ₱100,000, split equally |
| **Pag-IBIG** | 2% each on up to ₱10,000 a month (₱200 + ₱200 at most). Employee 1% at ₱1,500 or less |
| **Withholding tax** | BIR monthly and semi-monthly tables for compensation from January 1, 2023 (TRAIN law). Contributions are deducted first. Minimum wage earners are exempt |
| **13th month** | Basic salary earned ÷ 12. Tax-free up to ₱90,000 together with other benefits |

## API

```js
import { computePay, sss, philhealth, pagibig, withholdingTax, annualTax, thirteenthMonth } from 'rdcruz-ph-payroll';

computePay({
  monthlyBasic: 35000,
  frequency: 'semi-monthly',  // or 'monthly'; contributions are split evenly across the pay periods
  taxableAllowances: 0,       // per month: taxable allowances, commissions, overtime
  nonTaxable: 2000,           // per month: de minimis and other tax-free pay
  minimumWageEarner: false,
  otherDeductions: 0,         // per month: loans, cash advances
});

sss(28000);                         // { msc: 28000, employee: 1400, employer: 2800, ec: 30, … }
withholdingTax(16087.5, 'semi-monthly');
annualTax(1_000_000);               // 152500
thirteenthMonth(1_200_000, 10_000); // { pay: 100000, taxable_excess: 20000 }
```

Rates live in `RATES_2026` and `TAX_TABLES`; pass your own to the single-purpose functions if a circular changes.

> **Check before you pay.** These follow the SSS, PhilHealth, HDMF and BIR rules in effect for 2026 as published. Agencies issue new circulars, and some cases (contribution caps for kasambahay, OFWs, voluntary members, tax on irregular pay, annualization in December) need their own handling. Use this to estimate, and confirm a real payroll with your accountant or the agencies' own tables.

## Tests

```sh
npm test
```

## License

[MIT](LICENSE)
