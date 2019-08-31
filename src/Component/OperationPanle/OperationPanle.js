import React, { useEffect, useRef } from "react";
import PropTypes, { element } from "prop-types";
import styled from "styled-components";
import "./OperationPanle.css";
import { createUUID } from "../../libs/utils";
import data from "../data";

const Box = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

const reRenderNodes = [
  {
    componentId: "2",
    nodeId: "89224e7d-b7d2-4e1f-9035-2f0ec07a5ccd",
    text: "朴素贝叶斯1",
    x: "160px",
    y: "75px"
  },
  {
    componentId: "2",
    nodeId: "801e5434-dde8-453b-97df-11b6fc42cc74",
    text: "朴素贝叶斯2",
    x: "284px",
    y: "149px"
  },
  {
    componentId: "3",
    nodeId: "a40917e3-0f85-4524-afb8-2e38487b1b34",
    text: "傅里叶3",
    x: "108px",
    y: "166px"
  }
];

const nodes = [];

/**
 * 初始化 jsplumb，并生成实例
 */
const initJsPlumb = () => {
  const jsPlumb = window.jsPlumb;
  let instance = jsPlumb.getInstance({
    DragOptions: { cursor: "pointer", zIndex: 2000 },
    Container: "js-container_for_node",
    // 定义线，箭头的位置
    ConnectionOverlays: [
      [
        "Arrow",
        {
          location: 0.5,
          visible: true,
          id: "ARROW",
          width: 5,
          length: 5
        }
      ],
      [
        "Custom", // 自定义箭头样式：一个 x 的图片， 点击删除连线
        {
          create: () => {
            const node = document.createElement("div");
            node.style.cursor = "pointer";
            node.style.width = "14px";
            node.style.height = "14px";

            const addClassCallBack = function() {
              node.className = "icon_delLink";
            };
            const removeClassCallBack = function() {
              node.className = "";
            };
            node.addEventListener("mouseenter", addClassCallBack);
            node.addEventListener("mouseleave", removeClassCallBack);

            return node;
          },
          location: 0.5,
          id: "customOverlay"
        }
      ]
    ]
  });
  instance.batch(function() {
    instance.bind("connection", function(info, originalEvent) {
      debugger;
      // updateConnections(info.connection);
    });
    instance.bind("connectionDetached", function(info, originalEvent) {
      debugger;
      // updateConnections(info.connection, true);
    });

    instance.bind("connectionMoved", function(info, originalEvent) {
      debugger;
      //  only remove here, because a 'connection' event is also fired.
      // in a future release of jsplumb this extra connection event will not
      // be fired.
      // updateConnections(info.connection, true);
    });
  });
  return instance;
};

/**
 * 处理端口信息，生成源端口和目标端口用于绘制的信息
 * type 1 为目标端口，只可输入 2 为源端口，只可输出
 * @param {*} ports
 * @param {*} nodeId
 * @rentern [sourceAnchors, targetAnchors]
 */
const createPortsDataForRender = (ports, nodeId) => {
  const targetAnchors = ports.filter(port => port.type === 1);
  const sourceAnchors = ports.filter(port => port.type === 2);

  const targetAnchorGap =
    parseInt((1 / (targetAnchors.length + 1)) * 100) / 100;
  const sourceAnchorGap =
    parseInt((1 / (sourceAnchors.length + 1)) * 100) / 100;

  console.log(ports);

  // [水平位置左到右0-1，垂直位置上到下0-1，0, 贝塞尔曲线曲率]
  return {
    sourceAnchors: sourceAnchors.map((item, index) => ({
      ...item,
      position: [sourceAnchorGap * (index + 1), 1, 0, 0.2],
      id: `${nodeId}_out_${item.name}`
    })),
    targetAnchors: targetAnchors.map((item, index) => ({
      ...item,
      position: [targetAnchorGap * (index + 1), 0, 0, -0.2],
      id: `${nodeId}_in_${item.name}`
    }))
  };
};

/**
 * 端口 hover 显示端口的详细信息
 * @param {*} endPoint
 * @param {*} anchor
 */
const renderPortInfoByHover = (endPoint, anchor) => {
  // 监听 mouseenter 事件，展示端口详细信息面板
  endPoint.canvas.addEventListener("mouseenter", event => {
    const left = event.pageX + 15 + "px";
    const top = event.pageY - 30 + "px";

    const dom = document.createElement("div");
    dom.style.position = "fixed";
    dom.style.left = left;
    dom.style.top = top;
    dom.id = "portMessage";
    dom.className =
      "portMessageS bg_color_13 font_color_11 co_bg_rightclick_dialog";
    const label = "端口名称";
    const dataType = "数据类型";
    const portDescription = "端口描述";
    dom.innerHTML = `
      <div class="portRow">${label}: ${anchor.cnName}</div>  
      <div class="portRow">${dataType}: ${anchor.dataType}</div>  
      <div class="portRow">${portDescription}: ${anchor.description}</div>  
    `;
    document.body.append(dom);
  });
  // 监听 mouseleave 事件，删除端口详细信息面板
  endPoint.canvas.addEventListener("mouseleave", () => {
    const dom = document.getElementById("portMessage");
    dom.parentNode.removeChild(dom);
  });
};

/**
 * 渲染端口
 * @param {*} instance 
 * @param {*} ports 
 * @param {*} nodeId 
 */
const renderPorts = (instance, ports, nodeId) => {
  // 配置端口基本信息信息
  const endPointBasicInfo = {
    endpoint: "Dot",
    hoverPaintStyle: {
      strokeStyle: "rgba(59,252,178,0.5)",
      fillStyle: "rgba(59,252,178,0.5)",
      radius: 10
    },
    dropOptions: {
      tolerance: "touch",
      hoverClass: "dropHover",
      activeClass: "dragActive"
    },
    // maxConnections: 1,
    connectorStyle: {
      strokeStyle: "rgba(153,153,153,1)",
      lineWidth: 1.5
    },
    connectorHoverStyle: {
      lineWidth: 1.5
      // strokeStyle: "#E03A49"
    },
    paintStyle: {
      strokeStyle: "rgba(68,68,68,1)",
      fillStyle: "rgba(68,68,68,1)",
      radius: 5.5,
      lineWidth: 1.5
    }
  };
  // 配置源端口信息
  const sourceEndPoint = { ...endPointBasicInfo, isSource: true,};
  // 配置目标端口信息
  const targetEndPoint = { ...endPointBasicInfo, isTarget: true,};

  // 生成用于渲染端口的数据
  const { sourceAnchors, targetAnchors } = createPortsDataForRender(
    ports,
    nodeId
  );

  // 生成源端口
  sourceAnchors.forEach(anchor => {
    const endPoint = instance.addEndpoint(
      nodeId,
      {
        anchor: anchor.position,
        scope: anchor.dataType,
        uuid: anchor.id
      },
      sourceEndPoint
    );
    // hover端口可查看详细信息
    renderPortInfoByHover(endPoint, anchor);
  });
  // 生成目标端口
  targetAnchors.forEach(anchor => {
    const endPoint = instance.addEndpoint(
      nodeId,
      {
        anchor: anchor.position,
        scope: anchor.dataType,
        uuid: anchor.id
      },
      targetEndPoint
    );
    renderPortInfoByHover(endPoint, anchor);
  });
};

/**
 * 渲染节点
 * @param {*} option.x 节点相对容器 y 方向的距离
 * @param {*} option.y 节点相对容器 x 方向的距离
 * @param {*} option.text 节点文本
 * @param {*} option.iconClass 节点的icon
 * @param {*} option.container 装节点的容器
 * @param {*} option.instance jsplumb实例
 * @param {*} option.nodeId 节点id
 */
const render = (option) => {
  const {
    x,
    y,
    text,
    iconClass,
    ports,
    container,
    instance,
    nodeId
  } = option
  // 创建节点
  const nodeDom = document.createElement("div");
  nodeDom.className = "node";
  nodeDom.title = text;
  nodeDom.style.left = x;
  nodeDom.style.top = y;
  nodeDom.id = nodeId;
  nodeDom.innerHTML = `
      <span class="node-icon_left"><i class="fa ${iconClass}"></i></span>
      <span class="node-text"><span>${text}</span></span>
      <span class="node-icon_right"><i class="fa fa-check" aria-hidden="true"></i></span>
  `;
  // 将节点渲染到页面上
  container.append(nodeDom);

  instance.batch(function() {
    // 让节点在面板中可拖拽
    instance.draggable(nodeDom, {
      containment: container
    });
    // 渲染端口
    renderPorts(instance, ports, nodeId);
  });
  return nodeDom;
};

/**
 * 一次性渲染所有节点
 * @param {*} nodes
 * @param {*} container
 * @param {*} instance
 */
const reRender = (nodes, container, instance) => {
  nodes.forEach(item => {
    const { componentId, nodeId } = item;
    const nodeInfo = data.find(item => item.id === componentId);
    render({ ...nodeInfo, ...item, container, instance, nodeId });
  });
};

/**
 * 获取节点展示的位置
 * @param {*} event
 */
const getPosition = event => {
  const mouseX = event.pageX;
  const mouseY = event.pageY;
  const parentX = event.target.offsetLeft;
  const parentY = event.target.offsetTop;
  const x = mouseX - parentX + "px";
  const y = mouseY - parentY + "px";
  return { x, y };
};

// jsPlumb 实例
let instance = null;
/**
 * 操作平台组件
 * @param {*} props
 */
const OperationPanle = props => {

  const containerRef = useRef(null);

  useEffect(() => {
    instance = initJsPlumb();
    const container = containerRef.current;
    reRender(reRenderNodes, container, instance);
    return () => {};
  }, []);

  /**
   * 处理节点释放到容器中
   * @param {*} event
   */
  const drop = event => {
    event.preventDefault();

    // 获取从列表那边获取的数据
    const data = JSON.parse(event.dataTransfer.getData("text"));

    // 获取节点展示的位置
    const { x, y } = getPosition(event);

    const container = event.target;
    const UUID = createUUID();

    // 用于保存的节点数据
    const nodeInfo = {
      componentId: data.id,
      nodeId: UUID,
      text: data.text,
      x,
      y
    };

    // 渲染节点
    render({ ...data, x, y, container, instance, nodeId: UUID });
    nodes.push(nodeInfo);
    console.log("node info in panle:", JSON.stringify(nodes));
  };

  function allowDrop(event) {
    event.preventDefault();
  }

  return (
    <Box
      ref={containerRef}
      className="container"
      id="js-container_for_node"
      onDragOver={allowDrop}
      onDrop={drop}
    ></Box>
  );
};

OperationPanle.propTypes = {};

export default OperationPanle;
