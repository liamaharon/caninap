import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { contract } = this.state;

    // Get the value from the contract to prove it worked.
    const name = await contract.methods.getName().call();
    const expireBlock = await contract.methods.getExpireBlock().call();

    // Update state with the result.
    this.setState({ name, expireBlock: expireBlock.toString() });
  };

  sleep = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.set('liam').send({ from: accounts[0] });
    const name = await contract.methods.getName().call();
    const expireBlock = await contract.methods.getExpireBlock().call();
    this.setState({name, expireBlock: expireBlock.toString()});
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <button onClick = {() => this.sleep()}> 
          book a lazy 20 mins
        </button>
        <div>The stored name is: {this.state.name}</div>
        <div>The stored expireBlock is: {this.state.expireBlock}</div>
      </div>
    );
  }
}

export default App;
