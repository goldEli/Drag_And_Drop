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
    PaintStyle: { stroke: "#666" },
    EndpointHoverStyle: { fill: "orange" },
    HoverPaintStyle: { stroke: "orange" },
    EndpointStyle: { width: 20, height: 16, stroke: "#666" },
    Endpoint: "Rectangle",
    Anchors: ["TopCenter", "TopCenter"],
    Container: "js-container_for_node"
    // ConnectionOverlays: [
    //   [
    //     "Arrow",
    //     {
    //       location: 0.5,
    //       visible: true,
    //       id: "ARROW",
    //       width: 5,
    //       length: 5
    //     }
    //   ]
    // ],
    // anchor: ["Continuous", { faces: ["top", "bottom"] }],
    // endpoint: ["Dot", { radius: 5, hoverClass: "myEndpointHover" }],
    // connector: ["Bezier", { curviness: 100 }]
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
 * 渲染节点
 * @param {*} x 节点相对容器 y 方向的距离
 * @param {*} y 节点相对容器 x 方向的距离
 * @param {*} text 节点文本
 * @param {*} iconClass 节点的icon
 * @param {*} container 装节点的容器
 * @param {*} instance jsplumb实例
 * @param {*} nodeId 节点id
 */
const render = ({ x, y, text, iconClass, container, instance, nodeId }) => {
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
  container.append(nodeDom);
  // 让节点可以拖拽
  // instance.draggable(window.jsPlumb.getSelector(".container .node"));

  var color2 = "#316b31";
  var exampleDropOptions = {
    tolerance: "touch",
    hoverClass: "dropHover",
    activeClass: "dragActive"
  };
  var exampleEndpoint2 = {
    endpoint: ["Dot", { radius: 10 }],
    // paintStyle: { fill: color2 },
    hoverPaintStyle: { strokeStyle: color2, fillStyle: color2, radius: 9 },
    paintStyle: {
      strokeStyle: color2,
      fillStyle: color2,
      radius: 5.5,
      lineWidth: 1
    },
    isSource: true,
    isTarget: true,
    scope: "green",
    connectorStyle: {
      strokeStyle: color2,
      lineWidth: 1
    },
    // connectorStyle: { stroke: color2, strokeWidth: 6 },
    connector: ["Bezier", { curviness: 63 }],
    maxConnections: 3,
    dropOptions: exampleDropOptions
  };
  var exampleEndpoint = {
    endpoint: "Dot",
    // hoverPaintStyle: {strokeStyle: '#3BFEB3',fillStyle: "#3D3D3D", radius: 7},
    hoverPaintStyle: {
      strokeStyle: 'rgba(59,252,178,0.5)',
      fillStyle: 'rgba(59,252,178,0.5)',
      radius: 10
    },
    dropOptions: exampleDropOptions,
    maxConnections: 1,
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
    },
    isSource: true,
    isTarget: true,
    scope: "green",
  };
  instance.batch(function() {
    instance.draggable(nodeDom, {
      containment: container
    });
    instance.addEndpoint(nodeId, { anchor: [0.5, 1, 0, 1] }, exampleEndpoint);
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
