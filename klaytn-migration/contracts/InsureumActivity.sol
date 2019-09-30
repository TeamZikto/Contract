/**
 * @title Insureum Activity
 */

pragma solidity 0.4.25;

contract InsureumActivity {
    address private owner;

    mapping (uint => uint) internal userId;
    mapping (uint => uint) internal serviceId;
    mapping (uint => string) internal date;
    mapping (uint => string) internal steps;

    constructor() public {
        owner = msg.sender;
    }

    function setActivity(uint _id, uint _userId, uint _serviceId, string _date, string _steps) public {
        userId[_id] = _userId;
        serviceId[_id] = _serviceId;
        date[_id] = _date;
        steps[_id] = _steps;
    }

    function getUserId(uint _id) public view returns (uint) {
        return userId[_id];
    }

    function getServiceId(uint _id) public view returns (uint) {
        return serviceId[_id];
    }

    function getDate(uint _id) public view returns (string) {
        return date[_id];
    }

    function getSteps(uint _id) public view returns (string) {
        return steps[_id];
    }
}