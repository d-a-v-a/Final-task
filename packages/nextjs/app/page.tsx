"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useReadContract, useWriteContract, } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useMemo, useReducer, useState } from 'react';
import { useAllContracts } from '~~/utils/scaffold-eth/contractsData';
import { ContractName } from '~~/utils/scaffold-eth/contract';
import { useDeployedContractInfo, useNetworkColor, useTargetNetwork, useTransactor } from '~~/hooks/scaffold-eth';
import { getParsedContractFunctionArgs } from '~~/app/debug/_components/contract';


const Home: NextPage = () => {
  const [choose,setChoose] = useState(0)
  const { address: connectedAddress } = useAccount();
  const contractsData = useAllContracts();
  const contractName = useMemo(() => Object.keys(contractsData) as ContractName[], [contractsData])[0];
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo({ contractName });
  const networkColor = useNetworkColor();


  const [result0, setResult0] = useState<unknown>();
  const [result1, setResult1] = useState<unknown>();
  const [result2, setResult2] = useState<unknown>();

  const read0 = useReadContract({
    address: deployedContractData?.address,
    functionName: 'proposals',
    abi: deployedContractData?.abi,
    args: [0],
    chainId: targetNetwork.id,
    query: {
      enabled: false,
      retry: false,
    },
  });
     read0.refetch().then(value => {
        if (value && value.data) {
          // @ts-ignore
          setResult0(value.data[1]);
        }
  })

  const read1 = useReadContract({
    address: deployedContractData?.address,
    functionName: 'proposals',
    abi: deployedContractData?.abi,
    args: [1],
    chainId: targetNetwork.id,
    query: {
      enabled: false,
      retry: false,
    },
  });
  read1.refetch().then(value => {
    if (value && value.data) {
      // @ts-ignore
      setResult1(value.data[1]);
    }
  })

  const read2 = useReadContract({
    address: deployedContractData?.address,
    functionName: 'proposals',
    abi: deployedContractData?.abi,
    args: [2],
    chainId: targetNetwork.id,
    query: {
      enabled: false,
      retry: false,
    },
  });
  read2.refetch().then(value => {
    if (value && value.data) {
      // @ts-ignore
      setResult2(value.data[1]);
    }
  })
  const writeTxn = useTransactor();

  const { data: result, isPending, writeContractAsync } = useWriteContract();

  const makeVote = async () => {
    if (writeContractAsync) {
      try {
        const makeWriteWithParams = () =>
            writeContractAsync({
              address: deployedContractData?.address,
              functionName: 'vote',
              abi: deployedContractData?.abi,
              args: [`${choose}`],
              value: "",
            });
        await writeTxn(makeWriteWithParams);
        triggerRefreshDisplayVariables();
      } catch (e: any) {
        console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
      }
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Добро пожаловать на</span>
            <span className="block text-4xl font-bold">Голосование за самую вкусную шоколадку</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div style={{width: '100%', textAlign: 'center', marginBottom: '20px'}}>Кликните на шоколадку и нажмите голосовать!</div>
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div onClick={() => setChoose(0)} style={{backgroundColor: choose === 0 ? '#78a2b7' : 'white', transition: 'all ease-in-out 0.3s'}} className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <img src={'https://avatars.mds.yandex.net/get-mpic/4250892/img_id3237075878572202962.jpeg/orig'}></img>
              <p>
                Сникерс
              </p>
              <div> Проголосовало: {`${result0}`}</div>
            </div>
            <div onClick={() => setChoose(1)}
                 style={{backgroundColor: choose === 1 ? '#78a2b7' : 'white', transition: 'all ease-in-out 0.3s'}}
                 className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <img
                  src={'https://izymmag.ru/images/cms/data/import_files/8e/8e769b66db2511e7fb9400505689c502_67c38abc98f911eabc8e00505689c502.jpg'}></img>
              <p>
                Nuts
              </p>
              <div> Проголосовало: {`${result1}`}</div>
            </div>
            <div onClick={() => setChoose(2)}
                 style={{backgroundColor: choose === 2 ? '#78a2b7' : 'white', transition: 'all ease-in-out 0.3s'}}
                 className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <img src={'https://s.f.kz/prod/2667/2666688_550.jpg'}></img>
              <p>
                Kitkat
              </p>
              <div> Проголосовало: {`${result2}`}</div>
            </div>
          </div>

          <div style={{width: '100%', textAlign: 'center', margin: '20px'}}>
            Ваш выбор: {choose === 0 ? 'Сникерс' : choose === 1 ? 'Nuts' : choose === 2 ? 'Kitkat' : '' }
          </div>

          <div style={{width: '100%', marginTop: '40px', display: 'flex', justifyContent: 'center'}}>
            <button onClick={makeVote} style={{backgroundColor: '#f4f8ff', margin: '0 auto', borderRadius: '5px', padding: '5px'}} className={`btn btn-secondary btn-sm font-light hover:border-transparent`}>Голосовать!</button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Home;
