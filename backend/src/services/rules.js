// --- No changes to `get` helper ---
const get = (obj, path, defaultValue = undefined) => {
  if (typeof path !== "string" || path === "") return defaultValue;
  const travel = (regexp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res, key) => (res !== null && res !== undefined ? res[key] : res),
        obj
      );
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

// PRD RULE 1: TOTALS_BALANCE
const validateTotalsBalance = (invoice, map, index) => {
  const totalExclVat = parseFloat(
    get(invoice, map["invoice.total_excl_vat"], 0)
  );
  const vatAmount = parseFloat(get(invoice, map["invoice.vat_amount"], 0));
  const totalInclVat = parseFloat(
    get(invoice, map["invoice.total_incl_vat"], 0)
  );
  if (
    !map["invoice.total_excl_vat"] ||
    !map["invoice.vat_amount"] ||
    !map["invoice.total_incl_vat"]
  )
    return null;
  if (Math.abs(totalExclVat + vatAmount - totalInclVat) > 0.01) {
    return { expected: totalInclVat, got: totalExclVat + vatAmount };
  }
  return null;
};

// PRD RULE 2: LINE_MATH
const validateLineMath = (invoice, map, index) => {
  const lines = get(invoice, map.lines);
  if (!lines) return null;

  if (Array.isArray(lines)) {
    // JSON case
    for (const [lineIndex, line] of lines.entries()) {
      const qty = parseFloat(
        get(
          line,
          map.reverseMap
            ? Object.keys(map.reverseMap)
                .find((k) => map.reverseMap[k] === "lines.qty")
                ?.split(".")
                .pop()
            : "qty"
        )
      );
      const unitPrice = parseFloat(
        get(
          line,
          map.reverseMap
            ? Object.keys(map.reverseMap)
                .find((k) => map.reverseMap[k] === "lines.unit_price")
                ?.split(".")
                .pop()
            : "unit_price"
        )
      );
      const lineTotal = parseFloat(
        get(
          line,
          map.reverseMap
            ? Object.keys(map.reverseMap)
                .find((k) => map.reverseMap[k] === "lines.line_total")
                ?.split(".")
                .pop()
            : "line_total"
        )
      );
      if (isNaN(qty) || isNaN(unitPrice) || isNaN(lineTotal)) continue;
      if (Math.abs(qty * unitPrice - lineTotal) > 0.01) {
        return {
          expected: qty * unitPrice,
          got: lineTotal,
          exampleLine: lineIndex + 1,
        };
      }
    }
  } else {
    // Flat CSV case
    const qty = parseFloat(get(invoice, map["lines.qty"]));
    const unitPrice = parseFloat(get(invoice, map["lines.unit_price"]));
    const lineTotal = parseFloat(get(invoice, map["lines.line_total"]));
    if (isNaN(qty) || isNaN(unitPrice) || isNaN(lineTotal)) return null;
    if (Math.abs(qty * unitPrice - lineTotal) > 0.01) {
      return {
        expected: qty * unitPrice,
        got: lineTotal,
        exampleLine: index + 1,
      };
    }
  }
  return null;
};

// PRD RULE 3: DATE_ISO
const validateDateISO = (invoice, map, index) => {
  const dateStr = get(invoice, map["invoice.issue_date"]);
  if (!dateStr) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { value: dateStr };
  }
  return null;
};

// PRD RULE 4: CURRENCY_ALLOWED
const validateCurrencyAllowed = (invoice, map, index) => {
  const currency = get(invoice, map["invoice.currency"]);
  if (
    currency &&
    !["AED", "SAR", "MYR", "USD"].includes(currency.toUpperCase())
  ) {
    return { value: currency };
  }
  return null;
};

// PRD RULE 5: TRN_PRESENT
const validateTrnPresent = (invoice, map, index) => {
  const sellerTrn = get(invoice, map["seller.trn"]);
  const buyerTrn = get(invoice, map["buyer.trn"]);
  if (!sellerTrn || !buyerTrn) {
    return {
      message: `Seller TRN: ${sellerTrn ? "Present" : "Missing"}, Buyer TRN: ${
        buyerTrn ? "Present" : "Missing"
      }`,
    };
  }
  return null;
};

const RULES = [
  { id: "TOTALS_BALANCE", func: validateTotalsBalance },
  { id: "LINE_MATH", func: validateLineMath },
  { id: "DATE_ISO", func: validateDateISO },
  { id: "CURRENCY_ALLOWED", func: validateCurrencyAllowed },
  { id: "TRN_PRESENT", func: validateTrnPresent },
];

export const runAllRules = (data, fieldMap, reverseMap) => {
  const findings = [];
  const rulePassFail = {};
  RULES.forEach((r) => (rulePassFail[r.id] = { passed: 0, failed: 0 }));

  data.forEach((invoice, index) => {
    RULES.forEach((rule) => {
      const finding = rule.func(invoice, { ...fieldMap, reverseMap }, index);
      if (finding) {
        rulePassFail[rule.id].failed++;
        // Add finding only once per rule
        if (!findings.some((f) => f.rule === rule.id)) {
          findings.push({
            rule: rule.id,
            ok: false,
            invoiceId:
              get(invoice, fieldMap["invoice.id"]) || `Row ${index + 1}`,
            ...finding,
          });
        }
      } else {
        rulePassFail[rule.id].passed++;
      }
    });
  });

  return { findings, stats: rulePassFail };
};
