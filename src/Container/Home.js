import React from "react";
import PropTypes from "prop-types";
import { Layout } from "antd";
import FlowTree from "../Component/FlowTree/FlowTree";
import OperationPanle from "../Component/OperationPanle/OperationPanle";

const { Sider, Content } = Layout;

const reRenderData = {
  nodes: [
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
  ],
  links: [
    {
      inNodeId: "89224e7d-b7d2-4e1f-9035-2f0ec07a5ccd",
      inPortId: "a40917e3-0f85-4524-afb8-2e38487b1b34_in_dataset",
      inPortName: "stat",
      inType: "dataset",
      linkId:
        "89224e7d-b7d2-4e1f-9035-2f0ec07a5ccda40917e3-0f85-4524-afb8-2e38487b1b34statdataset",
      outNodeId: "a40917e3-0f85-4524-afb8-2e38487b1b34",
      outPortId: "89224e7d-b7d2-4e1f-9035-2f0ec07a5ccd_out_stat",
      outPortName: "dataset",
      outType: "dataset"
    }
  ]
};

function Home(props) {
  return (
    <Layout>
      <Layout>
        <Sider style={{ background: "#ded9d9" }}>
          <FlowTree />
        </Sider>
        <Content>
          <OperationPanle reRenderData={reRenderData} />
        </Content>
      </Layout>
    </Layout>
  );
}

Home.propTypes = {};

export default Home;
