import React, { Component } from "react";
import assist from 'bnc-assist';
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";

import bg from "./bg.png"

import "./App.css";

class App extends Component {
  state = { blockN: 0, name: 0, expireBlock: 0, web3: null, accounts: null, contract: null, input: '' };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      const networkId = 1;
      const assistInstance = assist.init({
        networkId,
        web3,
        dappId: '5e9e05e9-6631-49d8-8a70-f29dee0d26c5',
        style: { darkMode: true }
      })
      await assistInstance.onboard()

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = assistInstance.Contract(
        new web3.eth.Contract(
          SimpleStorageContract.abi,
          deployedNetwork && deployedNetwork.address,
        )
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
      
      setInterval(async () => {
        const {name, blockN, expireBlock, contract} = this.state;
        const currBlock = await web3.eth.getBlockNumber();  
        const newName = await this.state.contract.methods.getName().call();
        const newExpireBlock = await contract.methods.getExpireBlock().call();
        if (currBlock !== blockN) {
          this.setState({blockN: currBlock});
        }
        if (newName !== name) {
          this.setState({name: newName});
        }
        if (newExpireBlock !== expireBlock) {
          this.setState({expireBlock: newExpireBlock});
        }

      }, 3000);
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { contract, web3 } = this.state;

    // Get the value from the contract to prove it worked.
    const name = await contract.methods.getName().call();
    const expireBlock = await contract.methods.getExpireBlock().call();
    const blockN = await web3.eth.getBlockNumber()

    // Update state with the result.
    this.setState({ name, expireBlock: expireBlock.toString(), blockN });
  };

  sleep = async () => {
    const { accounts, contract, input } = this.state;
    await contract.methods.set(input).send({ from: accounts[0] });
    const name = await contract.methods.getName().call();
    const expireBlock = await contract.methods.getExpireBlock().call();
    this.setState({name, expireBlock: expireBlock.toString()});
  }

  handleChange = (e) => {
    this.setState({input: e.target.value})
  }

  getContent = () => {
    if (this.state.blockN == 0) {
      return (
        <div>
          <h1 style={{color: 'red', fontSize: '25px'}}>tis loading fam</h1>
        </div>
      )
    } else {
      return (
        this.state.expireBlock > this.state.blockN 
        ? <div>
            <h1 style={{color: 'red', fontSize: '20px'}}>🚨️🚨🚨{this.state.name} is napping🚨🚨🚨️</h1>
            <h1 style={{color: 'red', fontSize: '20px'}}>YOU MAY NOT NAP FOR {this.state.expireBlock - this.state.blockN} BLOCKS</h1>
          </div>
        : <div>
            <h1 style={{color: 'green', fontSize: '20px'}}>😍 The lie down cot is eMptY 😍</h1>
            <h1 style={{color: 'green', fontSize: '20px'}}>🙏😊🙏 ✔️YOU MAY REGISTER TO NAP✔️ 🙏😊🙏</h1>
            <button onClick = {() => this.sleep()}> 
              book a lazy 20 min
            </button>
            <input style={{border: '1px solid purple'}} value={this.state.input} placeholder='alias' onChange={this.handleChange}></input>
          </div>
      )
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <img src={bg} style={{height: '90%', position: 'fixed', top: '5%', margin: 'auto', zIndex: '-100', border: '10px solid purple'}}>
        </img>
        <div className="Content">
          {
            this.getContent()
          }
        </div>
      </div>
    );
  }
}

export default App;
