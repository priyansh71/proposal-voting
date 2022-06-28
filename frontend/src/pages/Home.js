import React, {useEffect, useState} from "react";
import { Form, Tab, Table, TabList, Tag, Widget } from "web3uikit";
import { Link } from "react-router-dom";
import { useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction } from "react-moralis";
import "./pages.css";


const Home = () => {

    const [passRate, setPassRate] = useState(0);
    const [totalP, setTotalP] = useState(0);
    const [counted, setCounted] = useState(0);
    const {Moralis, isInitialized } = useMoralis();
    const [proposals, setProposals] = useState();
    const [voters, setVoters] = useState();
    const Web3API = useMoralisWeb3Api();
    const [sub, setSub] = useState();
    const contractProcessor = useWeb3ExecuteFunction();


    const createProposal = async (newProposal) => {
      let options = {
        contractAddress: "0xc2f04A841Bf61d92FE312ac0D45FDa02e6577486",
        functionName: "createProposal",
        abi: [
          {
            inputs: [
              {
                internalType: "string",
                name: "_description",
                type: "string",
              },
              {
                internalType: "address[]",
                name: "_canVote",
                type: "address[]",
              },
            ],
            name: "createProposal",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        params: {
          _description: newProposal,
          _canVote: voters,
        },
      };
  
  
      await contractProcessor.fetch({
        params: options,
        onSuccess: () => {
          console.log("Proposal Succesful");
          setSub(false);
        },
        onError: (error) => {
          alert(error);
          setSub(false);
        },
      });
  
    }


    const getStatus = async (proposalId) => {
      const ProposalCounts = Moralis.Object.extend("ProposalCounts");
      const query = new Moralis.Query(ProposalCounts);
      query.equalTo("proposalId", proposalId);
      const result = await query.first();
      if (result !== undefined) {
        if (result.attributes.approved) {
          return { color: "green", text: "Passed" };
        } else {
          return { color: "red", text: "Rejected" };
        }
      } else {
        return { color: "blue", text: "Ongoing" };
      }
    };

    useEffect(() => {
      if (isInitialized) {
        const getProposals = async () => {
          const Proposals = Moralis.Object.extend("Proposals");
          const query = new Moralis.Query(Proposals);
          query.descending("proposalId_decimal");
          const results = await query.find();
          const table = await Promise.all(
            results.map(async (result) => [
              result.attributes.proposalId,
              result.attributes.description,
              <Link to='/proposal/'
                state={{
                  description : result.attributes.description,
                  color : (await getStatus(result.attributes.proposalId)).color,
                  text : (await getStatus(result.attributes.proposalId)).text,
                  id : result.attributes.proposalId,
                  proposer : result.attributes.proposer,
                }}
              >
                <Tag
                  color={(await getStatus(result.attributes.proposalId)).color}
                  text={(await getStatus(result.attributes.proposalId)).text}

                />
              </Link>
            ]));
          setProposals(table);
          setTotalP(results.length);
        }

        const getPassRate = async () => {
          const ProposalCounts = Moralis.Object.extend("ProposalCounts");
          const query = new Moralis.Query(ProposalCounts);
          const results = await query.find();
          let votesUp = 0;

          results.forEach((element) => {
            if(element.attributes.approved) votesUp++;
          });
          setCounted(results.length);
          setPassRate((votesUp / results.length) * 100);
        }

        const ownersOfToken = async () => {
          const options = {
            address : "0x2953399124F0cBB46d2CbACD8A89cF0599974963",
            token_id : "67841412279532801837515543174226035610057961491298794127114430528654986444801",
            chain : "mumbai"
          }
          const tokenIdOwners = await Web3API.token.getTokenIdOwners(options);
          const addresses = tokenIdOwners.result.map((element) => element.owner_of);
          setVoters(addresses);
        }

          ownersOfToken();
          getProposals();
          getPassRate();
      }
      else {
        console.log("not initialized");
      }
    }, [isInitialized]);
 
  return (
    <>
      <div className="content">
        <TabList defaultActiveKey={1} tabStyle="bulbUnion">
          <Tab tabKey={1} tabName="Proposals">
            {proposals && (
              <div className="tabContent">
              Overview
              <div className="widgets">
                <div className="first">
                <Widget
                  info={totalP}
                  title="Proposals Created"
                >
                  <div className="extraWidgetInfo">
                    <div className="extraTitle">Pass Rate</div>
                    <div className="progress">
                      <div
                        className="progressPercentage"
                        style={{ width: `${passRate}%`}}
                      ></div>
                    </div>
                    <div className="extraValue">{passRate}%</div>

                  </div>
                </Widget>
                </div>
                <Widget info={voters.length} title="Eligible Voters" />
                <Widget info={totalP-counted} title="Ongoing Proposals" />
              </div>
              Recent Proposals
              <div className="newProposal">
                <Table
                  columnsConfig="10% 70% 10%"
                  data={proposals}
                  header={[
                    <span style={{margin : "10px 20px"}}>ID</span>,
                    <span style={{margin : "10px 20px"}}>Description</span>,
                    <span style={{margin : "10px 20px"}}>Status</span>,
                  ]}
                  pageSize={5}
                />
              <Form
                  buttonConfig={{
                    isLoading: sub,
                    loadingText: "Submitting...",
                    text: "Submit",
                    theme: "secondary",
                  }}
                  data={[
                    {
                      inputWidth: "100%",
                      name: "New Proposal",
                      type: "textarea",
                      validation: {
                        required: true,
                      },
                      value: "",
                    },
                  ]}
                  onSubmit={(e) => {
                    setSub(true);
                    createProposal(e.data[0].inputResult);
                  }}
                  title="Create a New Proposal"
                />
              </div>
              </div>

            )}
          </Tab>
          <Tab tabKey={2} tabName="About">
            <div class="about">
              NFT proof for joining is linked <a href="https://testnets.opensea.io/collection/proposal-nft">here.</a>
              <br />
              <br />
              Made by <a href="https://github.com/priyansh71">Priyansh</a> using&nbsp;
              <a href="https://moralis.io">Moralis.io</a>
            </div>
            </Tab>
        </TabList>
      </div>
      <div className="voting"></div>
    </>
  );
};

export default Home;
