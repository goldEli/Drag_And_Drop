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
  instance.batch(function() {});
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
 */
const render = ({ x, y, text, iconClass, container, instance }) => {
  const nodeDom = document.createElement("div");
  nodeDom.className = "node";
  nodeDom.title = text;
  nodeDom.style.left = x;
  nodeDom.style.top = y;
  nodeDom.innerHTML = `
      <span class="node-icon_left"><i class="fa ${iconClass}"></i></span>
      <span class="node-text"><span>${text}</span></span>
      <span class="node-icon_right"><i class="fa fa-check" aria-hidden="true"></i></span>
  `;
  container.append(nodeDom);
  // 让节点可以拖拽
  // instance.draggable(window.jsPlumb.getSelector(".container .node"));
  instance.draggable(nodeDom, {
    containment: container
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
    const { componentId } = item;
    const nodeInfo = data.find(item => item.id === componentId);
    render({ ...nodeInfo, ...item, container, instance });
  });
}

/**
 * 获取节点展示的位置
 * @param {*} event 
 */
const getPosition = (event) => {
  const mouseX = event.pageX;
  const mouseY = event.pageY;
  const parentX = event.target.offsetLeft;
  const parentY = event.target.offsetTop;
  const x = mouseX - parentX + "px";
  const y = mouseY - parentY + "px";
  return {x, y}
}

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
    reRender(reRenderNodes, container, instance)
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
    const {x, y} = getPosition(event)

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
    render({ ...data, x, y, container, instance });
    nodes.push(nodeInfo);
    console.log("node info in panle:", JSON.stringify(nodes));
  };

  return (
    <Box
      ref={containerRef}
      className="container"
      onDrop={drop}
    ></Box>
  );
};


OperationPanle.propTypes = {};

export default OperationPanle;
