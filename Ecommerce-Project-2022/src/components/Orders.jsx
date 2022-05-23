import "regenerator-runtime/runtime"
import { useEffect, useMemo, useState } from "react"
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Checkbox,
  Group,
  Image,
  Menu,
  Select,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { CaretDown, CaretUp, DotsVertical } from "tabler-icons-react"
import { BsCaretLeftFill, BsCaretRightFill } from "react-icons/bs"
import {
  useAsyncDebounce,
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table"
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { toast } from "react-toastify"

import db from "../firebase"
import { useUserAuth } from "../App"
import GlobalFilter from "./GlobalFilter"

// Select Input Status Data
const statusData = [
  { label: "All", value: "" },
  { label: "Shipping", value: "shipping" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
]

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [filterState, setFilterState] = useState("")

  const { userState } = useUserAuth()

  const changeStatus = async (row, type) => {
    const { original } = row
    const orderRef = doc(db, "orders", original.orderId)
    setLoading(true)

    switch (type) {
      case "refund":
        await updateDoc(orderRef, {
          ...original,
          status: "refunded",
          updatedAt: serverTimestamp(),
        })
          .then(() => {
            toast.success("Order Refunded")
            setLoading(false)
          })
          .catch((err) => {
            console.log(err.message)
            setLoading(false)
          })
        return
      case "cancel":
        await updateDoc(orderRef, {
          ...original,
          status: "cancelled",
          updatedAt: serverTimestamp(),
        })
          .then(() => {
            toast.success("Order Refunded")
            setLoading(false)
          })
          .catch((err) => {
            console.log(err.message)
            setLoading(false)
          })
        return
      case "ship":
        await updateDoc(orderRef, {
          ...original,
          status: "shipping",
          updatedAt: serverTimestamp(),
        })
          .then(() => {
            toast.success("Order Refunded")
            setLoading(false)
          })
          .catch((err) => {
            console.log(err.message)
            setLoading(false)
          })
      default:
        return
    }
  }

  const handleColor = (value) => {
    switch (value) {
      case "refunded":
        return "red"
      case "cancelled":
        return "gray"
      case "delivered":
        return "green"
      default:
        return "yellow"
    }
  }

  const handleSelectChange = (val) => {
    setFilterState(val)
    onChange(val)
  }

  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined)
  }, 300)

  const ordersData = useMemo(() => [...orders], [orders])

  const ordersColumn = useMemo(
    () =>
      orders[0]
        ? Object.keys(orders[0])
            .filter((key) => key !== "updatedAt" && key !== "orderId")
            .map((key) => {
              if (key === "firstName") {
                return { Header: "NAME", accessor: key }
              }

              if (key === "status") {
                return {
                  Header: key.toUpperCase(),
                  accessor: key,
                  Cell: ({ value }) => (
                    <Badge size="md" color={handleColor(value)}>
                      {value}
                    </Badge>
                  ),
                }
              }

              return { Header: key.toUpperCase(), accessor: key }
            })
        : [],
    [orders]
  )

  const tableHooks = (hooks) => {}

  const tableInstance = useTable(
    { columns: ordersColumn, data: ordersData },
    useGlobalFilter,
    tableHooks,
    useSortBy,
    usePagination
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    preGlobalFilteredRows,
    setGlobalFilter,
    state,

    // Pagination
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  } = tableInstance

  // Get Data
  const fetchData = async () => {
    if (!userState) return

    const q = query(collection(db, "orders"), orderBy("updatedAt", "desc"))

    await onSnapshot(q, (snapshot) => {
      const temp = []
      snapshot.docs.map((doc) => temp.push({ ...doc.data(), orderId: doc.id }))

      setOrders(
        temp
          .filter((item) => item.sellerId === userState.uid)
          .map((item) => ({
            firstName: item.firstName,
            email: item.email,
            address: item.address,
            city: item.city,
            status: item.status,
            totalPayment: item.totalPayment,
            orderId: item.orderId,
            updatedAt: Date(item.updatedAt),
          }))
      )
      setLoading(false)
      setMounted(true)
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="relative flex flex-col w-full min-h-full p-4 mt-12 md:mt-0 gap-y-4 text-black/80">
      {/* Header */}
      <Group
        className="sticky top-0 z-50 flex max-w-[1200px] w-full bg-white rounded-lg"
        position="apart"
        align="center"
        p={20}
      >
        <Title order={2}>My Orders</Title>
      </Group>

      {/* Search Filters */}
      <Group position="apart" align="flex-end">
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          setGlobalFilter={setGlobalFilter}
          globalFilter={state}
        />

        <Select
          className="w-full md:w-80"
          label="Order Status"
          value={filterState}
          onChange={(val) => handleSelectChange(val)}
          data={statusData}
          size="md"
          radius={99}
        />
      </Group>

      {/* Show all column content */}
      <Checkbox
        size="sm"
        label="Show full column content"
        checked={isFixed}
        onChange={(e) => setIsFixed(e.target.checked)}
      />

      {/* Product Table */}
      <Skeleton animate visible={!mounted}>
        <div className="relative flex flex-col w-full bg-white border rounded-lg shadow-lg gap-y-4">
          {orders.length < 1 ? (
            <Center className="h-max">
              <Stack spacing={2} align="center">
                <Image src="/create_order.png" fit="contain" height={108} />
                <Text className="text-2xl" weight={700}>
                  No List of Orders for today.
                </Text>
              </Stack>
            </Center>
          ) : (
            <Skeleton
              className="overflow-x-auto w-full min-h-[240px]"
              animate
              visible={loading}
            >
              <table
                className={`min-w-[685px] w-full border-collapse ${
                  isFixed ? "table-auto" : "table-fixed"
                }`}
                {...getTableProps()}
              >
                <thead>
                  {
                    // Loop over the header rows
                    headerGroups.map((headerGroup) => (
                      // Apply the header row props
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {
                          // Loop over the headers in each row
                          headerGroup.headers.map((column, i) => (
                            // Apply the header cell props
                            <th
                              className={`p-4 border-b font-extrabold truncate text-sm text-left`}
                              {...column.getHeaderProps(
                                column.getSortByToggleProps()
                              )}
                            >
                              {
                                // Render the header
                                column.render("Header")
                              }
                              <span className="text-black/80">
                                {column.isSorted ? (
                                  column.isSortedDesc ? (
                                    <CaretDown size={20} />
                                  ) : (
                                    <CaretUp size={20} />
                                  )
                                ) : null}
                              </span>
                            </th>
                          ))
                        }
                        <th
                          className={`p-4 border-b font-extrabold truncate text-sm text-center`}
                        >
                          OPTIONS
                        </th>
                      </tr>
                    ))
                  }
                </thead>

                {/* Apply the table body props */}
                <tbody {...getTableBodyProps()}>
                  {
                    // Loop over the table rows
                    page.map((row, idx) => {
                      // Prepare the row for display
                      prepareRow(row)
                      return (
                        // Apply the row props
                        <tr
                          className="hover:bg-gray-100 rounded-2xl"
                          {...row.getRowProps()}
                        >
                          {
                            // Loop over the rows cells
                            row.cells.map((cell, i) => {
                              // Apply the cell props
                              return (
                                <td
                                  className={`p-4 truncate text-sm font-bold`}
                                  {...cell.getCellProps()}
                                >
                                  {
                                    // Render the cell contents
                                    cell.render("Cell")
                                  }
                                </td>
                              )
                            })
                          }
                          <td
                            className={`p-4 flex justify-center truncate text-sm font-bold`}
                          >
                            <Menu
                              control={
                                <ActionIcon
                                  variant="outline"
                                  radius={99}
                                  size="md"
                                  color="baseColor"
                                  loading={loading}
                                >
                                  <DotsVertical size={20} />
                                </ActionIcon>
                              }
                              size="xs"
                              placement="end"
                              position="bottom"
                              withArrow
                            >
                              <Menu.Item
                                onClick={() => changeStatus(row, "refund")}
                                className="font-bold"
                                color="red"
                              >
                                Refund
                              </Menu.Item>
                              <Menu.Item
                                onClick={() => changeStatus(row, "cancel")}
                                className="font-bold"
                                color="baseColor"
                              >
                                Cancel
                              </Menu.Item>
                              <Menu.Item
                                onClick={() => changeStatus(row, "ship")}
                                className="font-bold"
                                color="yellow"
                              >
                                Ship
                              </Menu.Item>
                            </Menu>
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </Skeleton>
          )}

          {/* Pagination Button */}
          <Group
            className="sticky left-0 w-full overflow-x-auto border-t lg:justify-end h-max"
            py={10}
            px={16}
            noWrap
          >
            <Button
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
              variant="outline"
              color="baseColor"
              radius={99}
              px={12}
            >
              First Page
            </Button>

            <ActionIcon
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              variant="outline"
              color="baseColor"
              radius={99}
            >
              <BsCaretLeftFill size={16} />
            </ActionIcon>

            <Text
              className="min-w-[100px] w-28"
              align="center"
              size="sm"
              weight={600}
            >
              {state.pageIndex + 1} - {pageOptions.length} of {orders.length}
            </Text>

            <ActionIcon
              onClick={() => nextPage()}
              disabled={!canNextPage}
              variant="outline"
              color="baseColor"
              radius={99}
            >
              <BsCaretRightFill size={16} />
            </ActionIcon>

            <Button
              onClick={() => gotoPage(pageOptions.length - 1)}
              disabled={!canNextPage}
              variant="outline"
              color="baseColor"
              radius={99}
              px={12}
            >
              Last Page
            </Button>

            <Select
              className="w-32 min-w-[100px]"
              radius={99}
              size="sm"
              defaultValue="5"
              onChange={(value) => setPageSize(Number(value))}
              data={["5", "10", "20"]}
              placeholder="Rows per page"
            />
          </Group>
        </div>
      </Skeleton>
    </div>
  )
}

export default Orders
