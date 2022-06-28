import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Blockie, Form, Icon, Table, Tag, Tooltip, Widget } from "web3uikit";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { useLocation } from "react-router-dom";
import "./pages.css";


const Proposal = () => {

  const { state : proposalDetails } = useLocation();
  const { Moralis, isInitialized } = useMoralis();
  const [latestVote, setLatestVote] = useState();
  const [percUp, setPercUp] = useState(0);
  const [percDown, setPercDown] = useState(0);
  const [votes, setVotes] = useState([]);
  const [sub, setSub] = useState();
  const contractProcessor = useWeb3ExecuteFunction();

  useEffect(() => {
    if (isInitialized) {
      const getVotes = async () => {
        const Votes = Moralis.Object.extend("Votes");
        const query = new Moralis.Query(Votes);
        query.equalTo("proposal", proposalDetails.id);
        query.descending("createdAt");
        const results = await query.find();
        if (results.length > 0) {
          setLatestVote(results[0].attributes);
          setPercDown(
            (
              (Number(results[0].attributes.votesDown) /
                (Number(results[0].attributes.votesDown) +
                  Number(results[0].attributes.votesUp))) *
              100
            ).toFixed(0)
          );
          setPercUp(
            (
              (Number(results[0].attributes.votesUp) /
                (Number(results[0].attributes.votesDown) +
                  Number(results[0].attributes.votesUp))) *
              100
            ).toFixed(0)
          );
        
        }

        const votesDirection = results.map((e) => [
          e.attributes.voter,
          <Icon
            fill={e.attributes.votedFor ? "#2cc40a" : "#d93d3d"}
            size={20}
            svg={e.attributes.votedFor ? "checkmark" : "arrowCircleDown"}
          />,
        ]);
          setVotes(votesDirection);
        } 
        getVotes();
      }}


      , [isInitialized]
    );


      const castVote = async (upDown) => {
    
        let options = {
          contractAddress: "0xc2f04A841Bf61d92FE312ac0D45FDa02e6577486",
          functionName: "voteOnProposal",
          abi: [
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "_id",
                  type: "uint256",
                },
                {
                  internalType: "bool",
                  name: "_vote",
                  type: "bool",
                },
              ],
              name: "voteOnProposal",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          params: {
            _id: proposalDetails.id,
            _vote: upDown,
          },
        };

        await contractProcessor.fetch({
          params: options,
          onSuccess: () => {
            console.log("Vote Cast Succesfully");
            setSub(false);
            alert("Transaction completed successfully.");
          },
          onError: (error) => {
            alert(error.data.message);
            setSub(false);
          },
        });
    
      }

  return (
    <>
      <div className="contentProposal">
        <div className="proposal">
          <Link to="/">
            <div className="backHome">
              <Icon fill="#ffffff" size={20} svg="chevronLeft" />
              Overview
            </div>
          </Link>
          <div className="describe">{proposalDetails.description}</div>
          <div className="proposalOverview">
            <Tag color={proposalDetails.color} text={proposalDetails.text} />
            <div className="proposer">
              <span>Proposed By </span>
              <Tooltip content={proposalDetails.proposer}>
                <Blockie seed={proposalDetails.proposer} />
              </Tooltip>
            </div>
          </div>
        </div>
        { latestVote && (
        <div className="widgets">
          <Widget info={latestVote.votesUp} title="Votes For">
            <div className="extraWidgetInfo">
              <div className="extraTitle">{percUp}%</div>
              <div className="progress">
                <div
                  className="progressPercentage"
                  style={{ width: `${percUp}%` }}
                ></div>
              </div>
            </div>
          </Widget>
          <Widget info={latestVote.votesDown} title="Votes Against">
            <div className="extraWidgetInfo">
              <div className="extraTitle">{percDown}%</div>
              <div className="progress">
                <div
                  className="progressPercentage"
                  style={{ width: `${percDown}%` }}
                ></div>
              </div>
            </div>
          </Widget>
        </div>
        )}
        <div className="votesDiv">
          <Table
            style={{ width: "400px" }}
            columnsConfig="80% 20%"
            data={votes}
            rowKey="id"
            header={[
            <span style={{margin : "10px 20px"}}>Address</span>,
            <span style={{margin : "10px 20px"}}>Vote</span>]}
            pageSize={5}
            />

          <Form
            isDisabled={proposalDetails.text !== 'Ongoing'}
            style={{
              width: "40px",
              height: "250px",
              border: "1px solid rgba(6, 158, 252, 0.2)",
            }}
            buttonConfig={{
              isLoading: sub,
              loadingText: "Casting Vote",
              text: "Vote",
              theme: "secondary",
            }}
            data={[
              {
                inputWidth: "100%",
                name: "Cast Your Vote",
                options: ["For", "Against"],
                type: "radios",
                validation: {
                  required: true,
                },
              },
            ]}
            onSubmit={(e) => {
              if(e.data[0].inputResult[0] === 'For') castVote(true);
              else castVote(false);
              setSub(true);
            }}
            title="Cast Your Vote"
          />
        </div>
     </div>
     <div className="voting2"></div>
    </>
  );
};

export default Proposal;
