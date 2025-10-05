// --- PRD ALIGNED: Mock GETS v0.1 Schema ---
const GETS_SCHEMA = [
  // Header
  { key: "invoice.id", required: true },
  { key: "invoice.issue_date", required: true },
  { key: "invoice.currency", required: true },
  { key: "invoice.total_excl_vat", required: true },
  { key: "invoice.vat_amount", required: true },
  { key: "invoice.total_incl_vat", required: true },
  // Seller
  { key: "seller.name", required: true },
  { key: "seller.trn", required: true },
  { key: "seller.country", required: false },
  { key: "seller.city", required: false },
  // Buyer
  { key: "buyer.name", required: true },
  { key: "buyer.trn", required: true },
  { key: "buyer.country", required: false },
  { key: "buyer.city", required: false },
  // Lines
  { key: "lines", required: true },
  { key: "lines.sku", required: false },
  { key: "lines.description", required: true },
  { key: "lines.qty", required: true },
  { key: "lines.unit_price", required: true },
  { key: "lines.line_total", required: true },
];

const REQUIRED_FIELDS = GETS_SCHEMA.filter((f) => f.required).map((f) => f.key);

// --- ALIAS MAP: Maps a flattened, lowercased user key to a GETS key ---
const ALIAS_MAP = {
  invid: "invoice.id",
  invno: "invoice.id",
  date: "invoice.issue_date",
  issuedon: "invoice.issue_date",
  currency: "invoice.currency",
  curr: "invoice.currency",
  totalexclvat: "invoice.total_excl_vat",
  totalnet: "invoice.total_excl_vat",
  vatamount: "invoice.vat_amount",
  vat: "invoice.vat_amount",
  totalinclvat: "invoice.total_incl_vat",
  grandtotal: "invoice.total_incl_vat",
  sellername: "seller.name",
  sellertrn: "seller.trn",
  sellertax: "seller.trn",
  buyername: "buyer.name",
  buyertrn: "buyer.trn",
  buyertax: "buyer.trn",
  lines: "lines",
  sku: "lines.sku",
  linesku: "lines.sku",
  description: "lines.description",
  linedescription: "lines.description",
  qty: "lines.qty",
  lineqty: "lines.qty",
  unitprice: "lines.unit_price",
  lineprice: "lines.line_price",
  linetotal: "lines.line_total",
};

// Flattens a user's invoice object and normalizes keys for mapping
const getFlatKeys = (obj, prefix = "") => {
  if (!obj) return [];
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? prefix + "." : "";
    const prop = obj[key];
    if (Array.isArray(prop) && prop.length > 0 && typeof prop[0] === "object") {
      acc.push(pre + key);
      acc.push(...getFlatKeys(prop[0], pre + key));
    } else {
      acc.push(pre + key);
    }
    return acc;
  }, []);
};

export const mapSchema = (data) => {
  if (!data || data.length === 0) {
    return {
      matched: [],
      closeMatch: [],
      missing: REQUIRED_FIELDS,
      fieldMap: {},
    };
  }

  const userKeys = Array.from(new Set(getFlatKeys(data[0])));
  const fieldMap = {}; // Maps GETS key -> user key
  const matched = new Set();
  const closeMatch = new Set();

  // Create a reverse map for easier lookup: user key -> GETS key
  const reverseMap = {};

  for (const userKey of userKeys) {
    const normalizedUserKey = userKey.toLowerCase().replace(/[\s_.]/g, "");

    // Check for exact match in schema
    if (GETS_SCHEMA.some((s) => s.key === userKey)) {
      fieldMap[userKey] = userKey;
      reverseMap[userKey] = userKey;
      if (REQUIRED_FIELDS.includes(userKey)) matched.add(userKey);
      continue;
    }

    // Check for alias match
    const getsKey = ALIAS_MAP[normalizedUserKey];
    if (getsKey) {
      fieldMap[getsKey] = userKey;
      reverseMap[userKey] = getsKey;
      if (REQUIRED_FIELDS.includes(getsKey))
        closeMatch.add({ target: getsKey, candidate: userKey });
    }
  }

  const foundGetsKeys = new Set([
    ...matched,
    ...Array.from(closeMatch).map((c) => c.target),
  ]);
  const missing = REQUIRED_FIELDS.filter((key) => !foundGetsKeys.has(key));

  return {
    matched: Array.from(matched),
    closeMatch: Array.from(closeMatch),
    missing,
    fieldMap,
    reverseMap, // Pass this to rules engine
  };
};
