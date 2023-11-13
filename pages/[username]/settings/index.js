import ConnectBLE_Camera from "@/components/ConnectBLE_Camera";
import AuthCheck from '@/components/AuthCheck';
import QRCodeGenerator from "@/components/QRCodeGenerator";

export default function UserSettings() {

    return (
      <>
        <AuthCheck>
            {/* <ConnectBLE_Camera /> */}
            <QRCodeGenerator />
        </AuthCheck>
      </>
    )
  }