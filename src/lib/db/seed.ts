import { ProcessLibraryItem } from "../types/route";

/** 标准工序种子数据 */
export const SEED_PROCESSES: Omit<
  ProcessLibraryItem,
  "id" | "isActive" | "createdAt" | "updatedAt"
>[] = [
  {
    code: "P01",
    name: "制泥",
    nameEn: "Clay Prep",
    category: "standard",
    description: "配料、球磨、过筛、除铁、陈腐",
    icon: "mud",
    sortOrder: 1,
    responsibleRole: "制泥工",
    defaultParams: JSON.stringify({
      球磨时间: { value: 8, unit: "小时", required: true, min: 4, max: 12 },
      细度: { value: 250, unit: "目", required: true, min: 200, max: 325 },
    }),
  },
  {
    code: "P02",
    name: "成型",
    nameEn: "Forming",
    category: "standard",
    description: "旋坯/注浆/压制，形成胚体",
    icon: "form",
    sortOrder: 2,
    responsibleRole: "成型工",
    defaultParams: JSON.stringify({
      成型方式: {
        value: "旋坯",
        options: ["旋坯", "注浆", "压制"],
        required: true,
      },
      胚体含水率: { value: 18, unit: "%", required: true, min: 15, max: 22 },
    }),
  },
  {
    code: "P03",
    name: "修坯",
    nameEn: "Trimming",
    category: "standard",
    description: "修整胚体外形，挖修孔位",
    icon: "trim",
    sortOrder: 3,
    responsibleRole: "修坯工",
    defaultParams: JSON.stringify({
      修坯方式: { value: "湿修", options: ["湿修", "干修"], required: true },
    }),
  },
  {
    code: "P04",
    name: "上釉",
    nameEn: "Glazing",
    category: "standard",
    description: "浸釉/喷釉，控制釉层厚度",
    icon: "glaze",
    sortOrder: 4,
    responsibleRole: "上釉工",
    defaultParams: JSON.stringify({
      上釉方式: { value: "浸釉", options: ["浸釉", "喷釉"], required: true },
      釉层厚度: { value: 0.5, unit: "mm", required: true, min: 0.3, max: 1.0 },
    }),
  },
  {
    code: "P05",
    name: "烧成",
    nameEn: "Firing",
    category: "standard",
    description: "窑炉烧制，控制温度曲线",
    icon: "fire",
    sortOrder: 5,
    responsibleRole: "烧成工",
    defaultParams: JSON.stringify({
      预热温度: { value: 80, unit: "℃", required: true, min: 60, max: 120 },
      最高温度: { value: 1050, unit: "℃", required: true, min: 950, max: 1200 },
      保温时间: { value: 120, unit: "分钟", required: true, min: 60, max: 240 },
    }),
  },
  {
    code: "P06",
    name: "胶装",
    nameEn: "Cementing",
    category: "standard",
    description: "铁帽胶装，水泥养护",
    icon: "cement",
    sortOrder: 6,
    responsibleRole: "胶装工",
    defaultParams: JSON.stringify({
      水泥牌号: {
        value: "42.5",
        options: ["32.5", "42.5", "52.5"],
        required: true,
      },
      养护时间: { value: 24, unit: "小时", required: true, min: 12, max: 72 },
    }),
  },
  {
    code: "P07",
    name: "试验",
    nameEn: "Testing",
    category: "standard",
    description: "工频耐压、机电破坏、热震试验",
    icon: "test",
    sortOrder: 7,
    responsibleRole: "试验员",
    defaultParams: JSON.stringify({
      试验电压: { value: 70, unit: "kV", required: true, min: 10, max: 200 },
      抽样比例: { value: 10, unit: "%", required: true, min: 5, max: 100 },
    }),
  },
  {
    code: "P08",
    name: "包装",
    nameEn: "Packaging",
    category: "standard",
    description: "检验分级、打包入库",
    icon: "package",
    sortOrder: 8,
    responsibleRole: "包装工",
    defaultParams: JSON.stringify({
      包装方式: {
        value: "木箱",
        options: ["木箱", "纸箱", "裸装"],
        required: true,
      },
      每箱数量: { value: 10, unit: "只", required: true, min: 1, max: 100 },
    }),
  },
];
