import AuthLayout from "../../components/auth/AuthLayout/AuthLayout";
import RegisterForm from "../../components/auth/RegisterForm/RegisterForm";

function Register() {
  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Register to start uploading datasets and training models."
    >
      <RegisterForm />
    </AuthLayout>
  );
}

export default Register;
