const MerkleTree = require('./merkle-tree');
const { bufferToHex, zeros } = require('ethereumjs-util');
const _ = require('lodash');

/*
 * `paymentList` is an array of objects that have a property `address` to hold the
 * payee's Ethereum address and `earnings` to hold the cumulative amount of tokens
 * paid to the payee across all payment cycles:
 *
 * [{
 *   address: "0x627306090abab3a6e1400e9345bc60c78a8bef57",
 *   earnings: 20
 * },{
 *   address: "0xf17f52151ebef6c7334fad080c5704d77216b732",
 *   earnings: 12
 * },{
 *   address: "0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef",
 *   earnings: 15
 * }]
 *
 */

class CumulativePaymentTree extends MerkleTree {
  constructor(paymentList) {
    let filteredPaymentList = paymentList.filter(payment => payment.address && payment.earnings);
    let groupedPayees = _.groupBy(filteredPaymentList, payment => payment.address);
    let reducedPaymentList = Object.keys(groupedPayees).map(address => {
      let payments = groupedPayees[address];
      let earnings = _.reduce(payments, (sum, payment) => sum + payment.earnings, 0);
      return { address, earnings };
    });
    super(reducedPaymentList);
    this.paymentNodes = reducedPaymentList
  }

  amountForPayee(address) {
    let payment = _.find(this.paymentNodes, { address });
    if (!payment) { return 0; }

    return payment.earnings;
  }

  hexProofForPayee(address, paymentCycle) {
    let leaf = _.find(this.paymentNodes, {address})
    if (!leaf) { return bufferToHex(zeros(32)); }
    return this.getHexProof(leaf, [ paymentCycle, this.amountForPayee(address) ]);
  }
}

module.exports = CumulativePaymentTree