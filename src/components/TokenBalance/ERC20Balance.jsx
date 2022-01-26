import { useMoralis, useNativeBalance, useMoralisCloudFunction} from "react-moralis";
import { Skeleton, Table } from "antd";
import { getEllipsisTxt, tokenValue } from "../../helpers/formatters";

function ERC20Balance() {
  const { data: balance } = useNativeBalance();
  const { Moralis, account } = useMoralis();
  const { data } = useMoralisCloudFunction(
    "getTokenBalances",
    { account },
    [],
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "25%",
      render: (name) => name,
    },
    {
      title: "Symbol",
      dataIndex: "symbol",
      key: "symbol",
      width: "25%",
      render: (symbol) => symbol,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: "25%",
      render: (value, item) => tokenValue(value, item.decimals).toFixed(6),
    },
    {
      title: "Address",
      dataIndex: "token_address",
      key: "token_address",
      width: "25%",
      render: (address) => getEllipsisTxt(address, 5),
    },
  ];

  return (  
    <div style={{ width: "50vw", backgroundColor: "rgba(50,50,50,0.6)", padding: "10px", boxshadow: "20px 20px", borderRadius: "30px"}}>
      <Skeleton loading={!data}>
        <Table
        //pagination= {false}
        className="ant-table"
          title={() => (
            <h1 style={{color: "orange"}}>{`AVAX Balance ${parseFloat(
              Moralis.Units.FromWei(balance.balance, 18).toFixed(6)
            )}`}</h1>
          )}
          dataSource={data}
          columns={columns}
          rowKey={(record) => {
            return record.token_address;
          }}
        />
      </Skeleton>
    </div>
  );
}
export default ERC20Balance;
