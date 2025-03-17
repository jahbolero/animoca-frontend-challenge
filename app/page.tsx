'use client';

import { useState, useEffect} from 'react';
import Web3 from 'web3';
import WalletConnect from '../components/WalletConnect';
import { verifyReferralCode, verifyUsedWallet, emailValidity, reserveSlot } from '../services/referralService';
import { validateEmailSyntax } from '../utils/helper';
export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [isWalletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    useEffect(() => {
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
        }
    }, []);

    const handleApplyCode = async () => {
        if (referralCode) {
            const isValidReferralCode = await verifyReferralCode(referralCode);
            if (!isValidReferralCode) {
                setError("Invalid referral code");
                return;
            }
            setIsModalOpen(true);
        }
    };

    const handleWalletConnected = async (address: string) => {
        try {
            setWalletConnected(true);
            setWalletAddress(address);
            console.log("Connected wallet address:", address);

            if (window.ethereum) {
                window.ethereum.on('accountsChanged', (accounts: string[]) => {
                    if (accounts.length === 0) {
                        setWalletConnected(false);
                        setWalletAddress('');
                    } else {
                        setWalletAddress(accounts[0]);
                    }
                });
            }

            const usedWallet = await verifyUsedWallet(address);
            if (usedWallet) {
                setError("Wallet already used");
                setIsModalOpen(false);
                return;
            }
        } catch (error) {
            console.log("Error with wallet:", error);
            return;
        }
    };

    const handleSubmit = async () => {
        if (!email || !walletAddress || !referralCode) return;
        setIsSubmitting(true);

        try {
            if (!validateEmailSyntax(email)) {
                setError("Invalid email syntax");
                setIsSubmitting(false);
                setIsModalOpen(false);
                return;
            }
            const isValidReferralCode = await verifyReferralCode(referralCode);
            if (!isValidReferralCode) {
                setError("Invalid referral code");
                setIsSubmitting(false);
                setIsModalOpen(false);
                return;
            }

            const isWalletUsed = await verifyUsedWallet(walletAddress);
            if (isWalletUsed) {
                setError("Wallet already used");
                setIsSubmitting(false);
                setIsModalOpen(false);
                return;
            }

            const isValidEmail = await emailValidity(email);
            if (isValidEmail) {
                setError("Invalid email");
                setIsSubmitting(false);
                return;
            }
            let signature = ""
            let message = "";

            if (web3 && window.ethereum) {
                try {
                    message = `Submitting referral code: ${referralCode} for email: ${email}`;
                    signature = await web3.eth.personal.sign(
                        message,
                        walletAddress,
                        ""
                    );
                } catch (signError) {
                    console.log("Error signing message:", signError);
                    setError("Error with signing the message. Please try again.");
                    setIsSubmitting(false);
                    return;
                }
            }
            const isSlotReserved = await reserveSlot(
                referralCode,
                walletAddress,
                email,
                signature,
                message
            );

            if (!isSlotReserved) {
                setError("Failed to reserve slot.");
                setIsSubmitting(false);
                setIsModalOpen(false);
                return;
            }
            setIsCompleted(true);
            setIsModalOpen(false);
            console.log("Referral successfully applied!");
        } catch (error) {
            console.log("Error submitting referral:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clean up event listeners
    useEffect(() => {
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => { });
                window.ethereum.removeListener('chainChanged', () => { });
            }
        };
    }, []);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center justify-center">
                <h1 className="font-bold mb-4 text-yellow-500">Mocaverse VIP Referral</h1>
                {isCompleted ? <div>
                    You are now a VIP member of Mocaverse.
                </div> : <div className="flex flex-col">
                    <input
                        type="text"
                        placeholder="Referral Code"
                        className="border-2 border-gray-300 rounded-md p-2 mb-3 w-50"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                    />
                    <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded-md w-50"
                        onClick={handleApplyCode}
                    >
                        Apply Code
                    </button>
                </div>
                }
                <div>
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed h-screen w-screen bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-end">
                            <div
                                className="bg-gray-200 hover:bg-gray-300 text-black px-2 py-2 rounded-full cursor-pointer"
                                onClick={() => setIsModalOpen(false)}
                            >
                                X
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-green-600 mb-2">Your referral code is valid!</h2>
                            <p className="text-gray-700">
                                {!isWalletConnected
                                    ? "Please connect your wallet to continue"
                                    : "Please provide your email to complete the process"}
                            </p>
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-4">
                            {!isWalletConnected ? (
                                <WalletConnect onConnect={handleWalletConnected} />
                            ) : (
                                <>
                                    <div className="w-full mb-2">
                                        <p className="text-sm text-gray-500 mb-1">Connected Wallet:</p>
                                        <p className="text-xs text-gray-700 font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                                            {walletAddress}
                                        </p>
                                    </div>
                                    <div className="w-full">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="w-full border-2 border-gray-300 text-black rounded-md p-2"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className={`w-full py-2 px-4 rounded-md transition-colors flex items-center justify-center ${email.trim() && !isSubmitting
                                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        disabled={!email.trim() || isSubmitting}
                                        onClick={handleSubmit}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit'
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
