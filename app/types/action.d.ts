type action = {
  type: "action",
  name: string,
  icon: string,
  action: {
    type:  "" |"link",
    to?: string
  }
};