import moment from "moment";

export const disabledDate = (current) => {
	return current && current >= moment().endOf("day");
};