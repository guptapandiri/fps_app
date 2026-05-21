export interface ShopDetails {
  fpsId: string;
  ownerName: string;
  location: string;
  district: string;
  mandal: string;
}

export interface CommodityList {
  comm_code: number;
  comm_name_en: string;
  comm_name_ll: string | null;
  availed_qty: number | null;
  unit_type: string | null;
  type_ll: string | null;
  scheme_id: number;
  scheme_desc: string | null;
  comm_scheme: string | null;
  source_type: string | null;
  comm_short: string | null;
  unit_type_scm: string | null;
  comm_id: number;
  saleQty: number | null;
  allomtQty: number;
  total_cards: number;
  avail_cards: number;
  avail_qty: number | null;
  availed_per: number | null;
  unit: string | null;
  qty_1: number | null;
  alot_month: number;
  scheme_type: string | null;
  scheme_name_en: string | null;
  comm_measure_unit: string | null;
  scheme_short_name: string | null;
  rate: number | null;
  zerocount: number;
  nonzerocount: number;
  recqty: number | null;
  allocation_type: string | null;
  allot_qty: number | null;
  sale_qty: number;
  nfsasaleQty: number;
  statesaleQty: number;
}

export interface Transaction {
  existingRcNumber: string;
  transStatus: string;
  schemeShortName: string;
  schemeId: string;
  receiptId: string;
  txnId: string;
  portCheck: string;
  amount: string;
  transTime: string;
  loginTime: string;
  auth_type: string;
  commodityList: CommodityList[];
}

export type Transactions = Transaction[];

export interface StockInfo {
  commodity: string;
  openingBalance: number;
  receipts: number;
  totalStock: number;
  sales: number;
  closingBalance: number;
}

export interface StockRegisterEntry {
  distNameEn: string | null;
  distCode: string | null;
  afso_name_en: string | null;
  afsoCode: string | null;
  fpsId: string;
  commNameEn: string;
  commId: string;
  commMeasureUnit: string;
  allottedQty: number;
  ob: number;
  receivedQty: number;
  extraRo: number;
  sixaCase: number;
  issuedQty: number;
  cb: number;
  refreshTime: string;
  scheme_id: number | null;
  scheme_short_name: string | null;
  prevMonth: string | null;
  curntMonth: string | null;
  type: string | null;
  futrMonth: string | null;
  fpsStatus: string | null;
  shopType: string | null;
}
