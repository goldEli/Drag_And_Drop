import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import "./OperationPanle.css";
import { createUUID } from "../../libs/utils";

const Box = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

const reRenderData = {
  "21ed8cda-cae1-47eb-adbd-f6f328cf01ce": {
    nodeId: "21ed8cda-cae1-47eb-adbd-f6f328cf01ce",
    text: "数据读取1",
    position: { x: "244px", y: "103px" }
  },
  "0246c00e-0cba-49f9-af2c-0501a9149d14": {
    nodeId: "0246c00e-0cba-49f9-af2c-0501a9149d14",
    text: "数据读取2",
    position: { x: "159px", y: "180px" }
  }
};

const nodes = {};

const allowDrop = event => {
  console.log("move");
  event.preventDefault();
};

const handleJsPlumb = () => {
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

const render = (option) => {
  const {x, y, text, iconClass, container, instance} = option
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
  instance.draggable(window.jsPlumb.getSelector(".container .node"));
  return nodeDom
}

let instance = null;
let instanceList = []
const OperationPanle = props => {

  useEffect(() => {
    console.log("============")
    instance = handleJsPlumb()
    return () => {};
  }, []);

  const drop = event => {
    event.preventDefault();

    const data = JSON.parse(event.dataTransfer.getData("text"));

    const mouseX = event.pageX;
    const mouseY = event.pageY;
    const parentX = event.target.offsetLeft;
    const parentY = event.target.offsetTop;
    const x = mouseX - parentX + "px";
    const y = mouseY - parentY + "px";   

    const container = event.target;
    const UUID = createUUID();
    const nodeInfo = {
      id: data.id,
      nodeId: UUID,
      text: data.text,
      position: { x: x, y: y }
    };
    render({...data, x, y, container, instance})
    instanceList.push(instance)
    console.log(instanceList)
    debugger
    nodes[UUID] = nodeInfo;
    console.log("node info in panle:", JSON.stringify(nodes));
  };

  return <Box className="container" onDrop={drop} onDragOver={allowDrop}></Box>;
};

OperationPanle.propTypes = {};

export default OperationPanle;
