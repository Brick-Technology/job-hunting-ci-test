import { Button, Form, FormInstance } from "antd";
import React from "react";

interface SubmitButtonProps {
    form: FormInstance;
}

const SubmitButton: React.FC<React.PropsWithChildren<SubmitButtonProps>> = ({
    form,
    children,
}) => {
    //TODO button disable when form field invalid
    return (
        <Button type="primary" htmlType="submit">
            {children}
        </Button>
    );
};

export default SubmitButton;