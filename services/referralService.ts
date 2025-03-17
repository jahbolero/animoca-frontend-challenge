export const verifyReferralCode = async (referralCode: string) => {
    try {
        const response = await fetch(`http://localhost:3000/api/referral/verifyCode?code=${referralCode}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error verifying referral code:', error);
        return false;
    }
};

export const verifyUsedWallet = async (walletAddress: string) => {
    try {
            const response = await fetch(`http://localhost:3000/api/referral/isWalletUsed?wallet=${walletAddress}`);
            const data = await response.json();
            return data;
    } catch (error) {
        console.log('Error verifying wallet validity:', error);
        return false;
    }
};

export const emailValidity = async (email: string) => {
  try {
    const response = await fetch(`http://localhost:3000/api/referral/isEmailUsed?email=${email}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error verifying email validity:', error);
    return false;
  }
};

export const reserveSlot = async (code: string, walletAddress: string, email: string, signature?: string, message?: string) => {
  try {
    const response = await fetch(`http://localhost:3000/api/referral/reserveSlot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        walletAddress,
        email,
        signature,
        message
      })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error reserving slot:', error);
    return false;
  }
};  





