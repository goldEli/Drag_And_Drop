import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import data from "../data"


const Box = styled.ol`
  padding: 10px;
  height: 300px;
`;
const Item = styled.li`
  cursor: pointer;
`;

const idPrefix = "node_id_";
let index = 0

/**
 * 拖拽处理
 * @param {*} event 
 */
function drag(event) {
  ++index
  const id = event.target.id.replace(idPrefix, "");
  let nodeInfo = data.find(item => item.id === id);
  nodeInfo = {...nodeInfo, text: nodeInfo.text + index}
  // 让节点 drop 的时候可以得到数据
  event.dataTransfer.setData("text", JSON.stringify(nodeInfo));
}

function FlowTree(props) {
  return (
    <Box>
      {data.map((item, index) => (
        <Item
          id={idPrefix + item.id}
          key={item.id}
          onDragStart={drag}
          draggable="true"
        >
          {item.text}
        </Item>
      ))}
    </Box>
  );
}

FlowTree.propTypes = {};

export default FlowTree;
