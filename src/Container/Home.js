import React from "react";
import PropTypes from "prop-types";
import { Layout } from "antd";
import FlowTree from "../Component/FlowTree/FlowTree"
import OperationPanle from "../Component/OperationPanle/OperationPanle"

const { Sider, Content } = Layout;

function Home(props) {
  return (
    <Layout>
      <Layout>
        <Sider style={{background: "#ded9d9"}}>
          <FlowTree />
        </Sider>
        <Content>
          <OperationPanle/>
        </Content>
      </Layout>
    </Layout>
  );
}

Home.propTypes = {};

export default Home;
