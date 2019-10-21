import ResetPassword from "../components/ResetPassword";

const Reset = props => {
  return (
    <ResetPassword resetToken={props.query.resetToken} />
  );
};

export default Reset;