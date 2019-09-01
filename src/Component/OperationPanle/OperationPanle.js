import React, { useEffect, useRef } from "react";
import PropTypes, { element, func } from "prop-types";
import styled from "styled-components";
import "./OperationPanle.css";
import { createUUID } from "../../libs/utils";
import algInfoData from "../data";
import $ from "jquery";

const Box = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

const nodes = [];
const links = [];

// jsPlumb 实例
let instance = null;

/**
 * 操作平台组件
 * @param {*} props
 */
function OperationPanle(props) {
  const { reRenderData } = props;

  const containerRef = useRef(null);

  /**
   * 一次性渲染所有节点，端口，连线
   */
  useEffect(() => {
    instance = initJsPlumb();
    const container = containerRef.current;
    const { nodes, links } = reRenderData;
    reRenderNodes(nodes, instance, container);
    reRenderLinks(links, instance);
    return () => {};
  }, [reRenderData]);

  return (
    <Box
      ref={containerRef}
      className="container"
      id="js-container_for_node"
      onDragOver={allowDrop}
      onDrop={drop}
    ></Box>
  );
}

/**
 * 初始化 jsplumb，并生成实例
 */
function initJsPlumb() {
  const jsPlumb = window.jsPlumb;
  let instance = jsPlumb.getInstance({
    DragOptions: { cursor: "pointer", zIndex: 10 },
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
            var node = $(
              '<div style="cursor:pointer; width:14px; height:14px"></div>'
            );
            node.unbind("mouseenter");
            node.unbind("mouseleave");
            node.mouseenter(function() {
              node.addClass("icon_delLink");
            });
            node.mouseleave(function() {
              node.removeClass("icon_delLink");
            });
            //  返回 jQuery 对象，jQuery 对象才能加上内置的 class
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
      // 当组件自身相连时，删除该条线。
      console.log("sourceId:", info.sourceId);
      console.log("targetId:", info.targetId);
      if (info.sourceId === info.targetId) {
        instance.detach(info.connection);
      }
      if (originalEvent && info.sourceId !== info.targetId) {
        let inNodeId = info.sourceId,
          inPortName = $(info.sourceEndpoint.canvas).attr("data-name"),
          inType = $(info.sourceEndpoint.canvas).attr("data-type"),
          outPortId = $(info.sourceEndpoint.canvas).attr("data-id"),
          outNodeId = info.targetId,
          outPortName = $(info.targetEndpoint.canvas).attr("data-name"),
          outType = $(info.targetEndpoint.canvas).attr("data-type"),
          inPortId = $(info.targetEndpoint.canvas).attr("data-id"),
          linkId = inNodeId + outNodeId + inPortName + outPortName;
        let link = {
          inNodeId: inNodeId,
          inPortName: inPortName,
          inType: inType,
          inPortId: inPortId,
          outNodeId: outNodeId,
          outPortName: outPortName,
          outType: outType,
          outPortId: outPortId,
          linkId: linkId
        };
        links.push(link)
        console.log('links：', links);
      }
      // updateConnections(info.connection);
    });
    instance.bind("click", function(info, a) {
      // 画面删除
      instance.detach(info);
    });
    instance.bind("connectionDetached", function(info, originalEvent) {
      let inNodeId = info.sourceId,
      outPortName = $(info.targetEndpoint.canvas).attr("data-name"),
      inPortName = $(info.sourceEndpoint.canvas).attr("data-name"),
      outNodeId = info.targetId,
      linkId = inNodeId + outNodeId + inPortName + outPortName
      console.log("删除：",linkId, links)
      // debugger;
      // updateConnections(info.connection, true);
    });

    instance.bind("connectionMoved", function(info, originalEvent) {
      // debugger;
      //  only remove here, because a 'connection' event is also fired.
      // in a future release of jsplumb this extra connection event will not
      // be fired.
      // updateConnections(info.connection, true);
    });
  });
  return instance;
}

/**
 * 处理端口信息，生成源端口和目标端口用于绘制的信息
 * type 1 为目标端口，只可输入 2 为源端口，只可输出
 * @param {*} ports
 * @param {*} nodeId
 * @rentern [sourceAnchors, targetAnchors]
 */
function portsDataProcess(ports, nodeId) {

  // 目标端口和源端口的间隔数，比如有1个端口就有是2个间隔
  let sumOfTargetAnchorsGap = ports.filter(port => port.type === 1).length + 1;
  let sumOfSourceAnchorsGap = ports.filter(port => port.type === 2).length + 1;

  // 目标端口和源端口的间隔大小
  let targetAnchorGap = parseInt((1 / (sumOfTargetAnchorsGap)) * 100) / 100;
  let sourceAnchorGap = parseInt((1 / (sumOfSourceAnchorsGap)) * 100) / 100;

  console.log("ports", ports);

  return ports.map((item, index) => {
    
    // 是否是源端口
    const isSourcePort = item.type === 2;

    // 每生成一个端口数据，端口间距减一
    isSourcePort ? --sumOfSourceAnchorsGap : --sumOfTargetAnchorsGap;

    /**
     * 端口位置
     * [水平位置左到右，范围0-1，垂直位置上到下，范围0-1，0, 贝塞尔曲线曲率]
     */
    const position = [
      isSourcePort
        ? sourceAnchorGap * sumOfSourceAnchorsGap
        : targetAnchorGap * sumOfTargetAnchorsGap,
      isSourcePort ? 1 : 0,
      0,
      isSourcePort ? 0.2 : -0.2
    ]
    
    // 端口id
    const id = isSourcePort
    ? `${nodeId}_out_${item.name}`
    : `${nodeId}_in_${item.name}`

    return {
      ...item,
      isSourcePort,
      position,
      id
    };
  });
}

/**
 * 端口 hover 显示端口的详细信息
 * @param {*} endPoint
 * @param {*} anchor
 */
function renderPortsInfoByHover(endPoint, anchor) {
  // 监听 mouseenter 事件，展示端口详细信息面板
  endPoint.canvas.addEventListener("mouseenter", event => {

    // 生成端口信息面板渲染的位置
    const left = event.pageX + 15 + "px";
    const top = event.pageY - 30 + "px";

    // 创建端口信息面板
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

    // render
    document.body.append(dom);
  });
  // 监听 mouseleave 事件，删除端口详细信息面板
  endPoint.canvas.addEventListener("mouseleave", () => {
    const dom = document.getElementById("portMessage");
    dom.parentNode.removeChild(dom);
  });
}

/**
 * 渲染端口
 * @param {*} instance
 * @param {*} ports
 * @param {*} nodeId
 */
function renderPorts(instance, ports, nodeId) {
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
  const sourceEndPoint = { ...endPointBasicInfo, isSource: true };
  // 配置目标端口信息
  const targetEndPoint = { ...endPointBasicInfo, isTarget: true };

  // 生成用于渲染端口的数据
  const portsData = portsDataProcess(ports, nodeId);

  // 生成源端口 和 目标端口
  portsData.forEach(item => {
    console.log('item.isSourcePort',item.isSourcePort)
    const endPoint = instance.addEndpoint(
      nodeId,
      {
        anchor: item.position,
        scope: item.dataType,
        uuid: item.id
      },
      item.isSourcePort ? sourceEndPoint : targetEndPoint
    );

    // 为节点添加属性，方便连线的时候获取
    $(endPoint.canvas)
      .attr("data-name", item.name)
      .attr("data-id", item.id)
      .attr("data-type", item.dataType);

    // hover端口可查看详细信息
    renderPortsInfoByHover(endPoint, item);
  });
}

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
function renderNode(option) {
  const { x, y, text, iconClass, ports, container, instance, nodeId } = option;
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
    // 渲染节点上的端口
    renderPorts(instance, ports, nodeId);
  });
  return nodeDom;
}

/**
 * 一次性渲染所有的线
 * @param {*} links
 * @param {*} instance
 */
function reRenderLinks(links, instance) {
  links.forEach(item => {
    const { inPortId, outPortId } = item;
    instance.connect({ uuids: [outPortId, inPortId], editable: true });
  });
}

/**
 * 一次性渲染所有节点，端口
 * @param {*} nodes
 * @param {*} container
 * @param {*} instance
 */
function reRenderNodes(nodes, instance, container) {
  nodes.forEach(item => {
    const { componentId, nodeId } = item;
    const nodeInfo = algInfoData.find(item => item.id === componentId);
    renderNode({ ...nodeInfo, ...item, container, instance, nodeId });
  });
}

/**
 * 获取节点展示的位置
 * @param {*} event
 */
function getPosition(event) {
  const mouseX = event.pageX;
  const mouseY = event.pageY;
  const parentX = event.target.offsetLeft;
  const parentY = event.target.offsetTop;
  const x = mouseX - parentX + "px";
  const y = mouseY - parentY + "px";
  return { x, y };
}

/**
 * 处理节点释放到容器中
 * @param {*} event
 */
function drop(event) {
  event.preventDefault();

  // 获取从列表那边获取的数据
  const data = JSON.parse(event.dataTransfer.getData("text"));

  // 获取节点展示的位置
  const { x, y } = getPosition(event);

  const container = event.target;
  const UUID = createUUID();

  // 保存节点数据，为了二次渲染
  const nodeInfo = {
    componentId: data.id,
    nodeId: UUID,
    text: data.text,
    x,
    y
  };

  // 渲染节点
  renderNode({ ...data, x, y, container, instance, nodeId: UUID });
  nodes.push(nodeInfo);
  console.log("node info in panle:", JSON.stringify(nodes));
}

/**
 * 移动过程中，节点释放前，阻止浏览器默认事件
 * @param {*} event
 */
function allowDrop(event) {
  event.preventDefault();
}

OperationPanle.propTypes = {};

export default OperationPanle;
