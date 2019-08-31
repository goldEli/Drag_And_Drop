const data = [
  {
    id: "1",
    iconClass: "fa-camera-retro",
    text: "数据读取",
    ports: [
      {
        cnName: "数据集",
        name: "dataset",
        dataTypeDesc: "数据集",
        dataType: "dataset",
        type: 1,
        description: "预测数据集"
      },
      {
        cnName: "算法模型/模型地址",
        name: "modelUrl",
        dataTypeDesc: "算法模型",
        dataType: "model",
        type: 1,
        description: "算法模型/模型存储地址"
      },
      {
        cnName: "预测结果集",
        name: "transform",
        dataTypeDesc: "数据集",
        dataType: "dataset",
        type: 2,
        description: "预测结果数据"
      }
    ]
  },
  {
    id: "2",
    iconClass: "fa-address-book",
    text: "朴素贝叶斯",
    ports: [
      {
        cnName: "数据集",
        name: "dataset",
        dataTypeDesc: "数据集",
        dataType: "dataset",
        type: 1,
        description: "训练数据集的数据源"
      },
      {
        cnName: "数据集1",
        name: "dataset",
        dataTypeDesc: "数据集1",
        dataType: "dataset1",
        type: 1,
        description: "训练数据集的数据源1"
      },
      {
        cnName: "全表统计",
        name: "stat",
        dataTypeDesc: "数据集",
        dataType: "dataset",
        type: 2,
        description: "全表统计，JSON格式的数据"
      },
      {
        cnName: "全表统计",
        name: "stat",
        dataTypeDesc: "数据集",
        dataType: "dataset",
        type: 2,
        description: "全表统计，JSON格式的数据"
      },
      {
        cnName: "全表统计",
        name: "stat",
        dataTypeDesc: "数据集",
        dataType: "dataset",
        type: 2,
        description: "全表统计，JSON格式的数据"
      }
    ]
  },
  {
    id: "3",
    iconClass: "fa-area-chart",
    text: "傅里叶",
    ports: [
      {
        cnName: "数据集",
        name: "dataset",
        dataTypeDesc: "数据集",
        dataType: "dataset",
        type: 1,
        description: "转换数据集"
      },
      {
        cnName: "结果数据",
        name: "transform",
        dataTypeDesc: "数据集",
        dataType: "dataset",
        type: 2,
        description: "转换后的数据集"
      }
    ]
  }
];

export default data