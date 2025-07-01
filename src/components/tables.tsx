import React from 'react';
import {
    type BalanceTransferItem, formatDate, formatHash, mapTransferHistoryToCsv, mapStakingHistoryItemsToCsv, type StakingHistoryItem,
} from '@/utils/staking-api.ts';
import {Pagination, usePagination} from '@/components/pagination.tsx';
import {DownloadCsv} from '@/components/download-csv.tsx';
import {BalanceSpan} from '@/components/balance-info.tsx';

const TableHeader: React.FC<{ children: React.ReactNode, align?: string }> = ({children, align = 'left'}) => {
    const alignClass = align === 'right' ? 'text-right' : 'text-left';

    return (
        <th className={`px-6 py-3 ${alignClass} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
            {children}
        </th>)
}

const SuccessBadge: React.FC = () => (<td className="px-6 py-4">
    <span
        className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-800 dark:text-green-100">
      Success
    </span>
</td>)

const AmountCell: React.FC<{ amount: string | bigint }> = ({amount}) => (
    <td className="px-6 py-4 text-right font-mono text-sm text-gray-900 dark:text-gray-100">
        <BalanceSpan value={{raw: amount.toString(), decimals: 18}} />
    </td>
)

const SectionMethodCell: React.FC<{item: { section: string, method: string }}> = ({item :{section, method}}) => (
    <td className="px-6 py-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {section} ({method})
        </span>
    </td>
)

const TimestampCell: React.FC<{ timestamp: string | Date }> = ({timestamp}) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
        {formatDate(timestamp)}
    </td>
)

const BlockNumberCell: React.FC<{ blockNumber: number }> = ({blockNumber}) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
        {blockNumber}
    </td>
)

type Chain = 'unique' | 'quartz';

type LinkCellProps = {
    extrinsicHash: string,
    blockNumber: number
    chain: Chain
}

const LinkCell: React.FC<LinkCellProps> = ({extrinsicHash, blockNumber, chain}) => {
    const url = chain === 'unique'
        ? `https://unique.subscan.io/extrinsic/${extrinsicHash}?tab=event`
        : `https://polkadot.js.org/apps/?rpc=wss://ws-quartz.unique.network#/explorer/query/${blockNumber}`;

    return (<td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline"
        >
            {formatHash(extrinsicHash)}
        </a>
    </td>)
}

const DirectionCell: React.FC<{ direction: 'in' | 'out' }> = ({direction}) => (
    <td className="px-6 py-4 text-right font-mono text-sm text-gray-900 dark:text-gray-100">
        {direction === 'in' ? (<span className="text-green-500">Incoming</span>) : (
            <span className="text-red-500">Outgoing</span>)}
    </td>
)

export const StakingTable: React.FC<{ stake: StakingHistoryItem[], chain: Chain }> = ({stake, chain}) => {
    const {
        page, setPage, pageSize, setPageSize, totalPages, currentPageData,
    } = usePagination(stake, 10);

    return (<>
        <table
            className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
                <TableHeader>Block</TableHeader>
                <TableHeader>Hash</TableHeader>
                <TableHeader>Time</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Method</TableHeader>
                <TableHeader align="right">Amount</TableHeader>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentPageData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <BlockNumberCell blockNumber={item.blockNumber} />
                    <LinkCell extrinsicHash={item.hash} blockNumber={item.blockNumber} chain={chain} />
                    <TimestampCell timestamp={item.blockTimestamp} />
                    <SuccessBadge />
                    <SectionMethodCell item={item} />
                    <AmountCell amount={item.amount} />
                </tr>))}
            </tbody>
        </table>
        <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
        />
        <DownloadCsv
            data={stake}
            mapToRows={mapStakingHistoryItemsToCsv}
            filename="staking-history.csv"
        />
    </>)
}

export const UnstakingTable: React.FC<{ unStake: StakingHistoryItem[], chain: Chain }> = ({unStake, chain}) => {
    const {
        page, setPage, pageSize, setPageSize, totalPages, currentPageData,
    } = usePagination(unStake, 10);

    return (<>
        <table
            className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
                <TableHeader>Block</TableHeader>
                <TableHeader>Hash</TableHeader>
                <TableHeader>Time</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Method</TableHeader>
                <TableHeader align="right">Amount</TableHeader>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentPageData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <BlockNumberCell blockNumber={item.blockNumber} />
                    <LinkCell extrinsicHash={item.hash} blockNumber={item.blockNumber} chain={chain} />
                    <TimestampCell timestamp={item.blockTimestamp} />
                    <SuccessBadge />
                    <SectionMethodCell item={item} />
                    <AmountCell amount={item.amount} />
                </tr>))}
            </tbody>
        </table>

        <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
        />
        <DownloadCsv
            data={unStake}
            mapToRows={mapStakingHistoryItemsToCsv}
            filename="unstaking-history.csv"
        />
    </>)
}

export const TransfersTable: React.FC<{ transfers: BalanceTransferItem[], chain: Chain }> = ({transfers, chain}) => {
    const {
        page, setPage, pageSize, setPageSize, totalPages, currentPageData,
    } = usePagination(transfers, 10);

    return (<>
        <table
            className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
                <TableHeader>Block</TableHeader>
                <TableHeader>Hash</TableHeader>
                <TableHeader>Time</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Method</TableHeader>
                <TableHeader>Direction</TableHeader>
                <TableHeader align="right">Amount</TableHeader>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentPageData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <BlockNumberCell blockNumber={item.blockNumber} />
                    <LinkCell extrinsicHash={item.extrinsicHash} blockNumber={item.blockNumber} chain={chain} />
                    <TimestampCell timestamp={item.blockTimestamp} />
                    <SuccessBadge />
                    <SectionMethodCell item={item} />
                    <DirectionCell direction={item.direction} />
                    <AmountCell amount={item.amount} />
                </tr>))}
            </tbody>
        </table>
        <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
        />
        <DownloadCsv
            data={transfers}
            mapToRows={mapTransferHistoryToCsv}
            filename="transfer-history.csv"
        />
    </>)
}

export const StakingRewardsTable: React.FC<{ stakingRewards: BalanceTransferItem[], chain: Chain }> = ({stakingRewards, chain}) => {
    const {
        page, setPage, pageSize, setPageSize, totalPages, currentPageData,
    } = usePagination(stakingRewards, 10);

    return (<>
        <table
            className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
                <TableHeader>Block</TableHeader>
                <TableHeader>Hash</TableHeader>
                <TableHeader>Time</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Method</TableHeader>
                <TableHeader align="right">Amount</TableHeader>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentPageData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <BlockNumberCell blockNumber={item.blockNumber} />
                    <LinkCell extrinsicHash={item.extrinsicHash} blockNumber={item.blockNumber} chain={chain} />
                    <TimestampCell timestamp={item.blockTimestamp} />
                    <SuccessBadge />
                    <SectionMethodCell item={item} />
                    <AmountCell amount={item.amount} />
                </tr>))}
            </tbody>
        </table>
        <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
        />
        <DownloadCsv
            data={stakingRewards}
            mapToRows={mapTransferHistoryToCsv}
            filename="staking-rewards-history.csv"
        />
    </>)
}