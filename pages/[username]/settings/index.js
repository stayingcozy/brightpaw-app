import ConnectBLE_Camera from "@/components/ConnectBLE_Camera";
import AuthCheck from '@/components/AuthCheck';

export default function UserSettings() {

    return (
      <>
        <AuthCheck>
            <ConnectBLE_Camera />
        </AuthCheck>
      </>
    )
  }