import { Program } from '@project-serum/anchor';
import { Connection, PublicKey } from "@solana/web3.js";
import { SOLPOOL_PROGRAM_ID } from "temp/constants";
import { getPoolDetail, getStakingProgram } from "temp/usePool/utils";
import { ConnectedWallet } from "@saberhq/use-solana";

export const getPoolAccount = async (poolAccount: any, program: any) => {
  const accountDetail = await program.account.pool.fetch(new PublicKey(poolAccount.pubkey))
  return {
    ...accountDetail,
    publicKey: new PublicKey(poolAccount.pubkey),
  }
}

export const getPools = async (
  wallet: ConnectedWallet,
  connection: Connection
) => {
  const filters = [
    {
      memcmp: {
        offset: 8,
        bytes: wallet.publicKey.toBase58(),
      },
    },
    {
      dataSize: 398,
    },
  ];
  let resp = await connection.getProgramAccounts(
    new PublicKey(SOLPOOL_PROGRAM_ID),
    {
      filters,
    }
  );

  if (resp.length == 0) {
    return [];
  }

  const stakingProgram = getStakingProgram(connection, wallet)
  const getPoolPromises = resp.map((account) => {
    return getPoolAccount(account, stakingProgram);
  });
  const pools = await Promise.all(getPoolPromises);
  return pools;
};
