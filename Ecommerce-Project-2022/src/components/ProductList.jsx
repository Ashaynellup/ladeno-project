import React, { useEffect, useMemo } from "react"
import {
  UnstyledButton,
  Group,
  Title,
  Text,
  Modal,
  TextInput,
  NumberInput,
  Loader,
  Stack,
  Divider,
  Button,
  ActionIcon,
  Image,
  Tooltip,
  RingProgress,
  ThemeIcon,
  Center,
  Select,
  Checkbox,
  Textarea,
  Skeleton,
  Badge,
} from "@mantine/core"
import { useState } from "react"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import db, { storage } from "../firebase"

import {
  Plus,
  Photo,
  Check,
  CaretDown,
  CaretUp,
  Edit,
  Trash,
} from "tabler-icons-react"
import { BsCaretLeftFill, BsCaretRightFill } from "react-icons/bs"
import {
  MdProductionQuantityLimits,
  MdOutlinePriceChange,
} from "react-icons/md"
import {
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table"
import moment from "moment"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

// import axios from "axios"
import { useUserAuth } from "../App"
import GlobalFilter from "./GlobalFilter"

const productState = {
  name: "",
  category: "",
  price: 0,
  description: "",
}

const categoryData = [
  { value: "Accessories", label: "Accessories" },
  { value: "Clothing", label: "Clothing" },
  { value: "Delicacy", label: "Delicacy" },
  { value: "Furnitures", label: "Furnitures" },
  { value: "Handicrafts", label: "Handicrafts" },
]

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [currUser, setCurrUser] = useState([])
  const [opened, setOpened] = useState(false)
  const [inputState, setInputState] = useState(productState)
  const [sizes, setSizes] = useState([])
  const [size, setSize] = useState("")
  const [colors, setColors] = useState([])
  const [color, setColor] = useState("")
  const [image, setImage] = useState()
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [errors, setError] = useState(null)
  const [isFixed, setIsFixed] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editState, setEditState] = useState(null)

  const { name, price, category, description } = inputState

  const navigate = useNavigate()
  const { userState } = useUserAuth()

  const handleChange = (e) => {
    const { name, value } = e.target

    setInputState({ ...inputState, [name]: value })
  }

  const handlePriceValue = (val) => {
    setInputState({ ...inputState, price: val })
  }

  const addColor = () => {
    setColor("")
    setColors([...colors, color])
  }

  const deleteColor = () => {
    const temp = [...colors]
    temp.pop()
    setColors(temp)
  }

  const addSize = () => {
    setSize("")
    setSizes([...sizes, size])
  }

  const removeSize = () => {
    const temp = [...sizes]
    temp.pop()

    setSizes(temp)
  }

  const handleImgChange = (e) => setImage(e.target.files[0])

  const handleError = () => {
    let error = {}

    if (!name || !price || !category) {
      error.name = "required"
      error.price = "required"
      error.category = "required"

      setError(error)
      setLoading(false)
      return true
    }

    if (!name) {
      error.name = "required"

      setError(error)
      setLoading(false)
      return true
    }

    if (!category) {
      error.category = "required"

      setError(error)
      setLoading(false)
      return true
    }

    if (!price) {
      error.price = "required"

      setError(error)
      setLoading(false)
      return true
    }

    return false
  }

  const saveProduct = () => {
    setLoading(true)
    setError(null)

    const isError = handleError()
    if (isError) return

    const storageRef = ref(storage, `product/${image?.name}`)
    const uploadTask = uploadBytesResumable(storageRef, image)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setProgress(progress)
      },
      (error) => {
        console.log(error.message)
      },
      async () => {
        const URL = await getDownloadURL(uploadTask.snapshot.ref)
        const productRef = collection(db, "products")

        await addDoc(productRef, {
          ...inputState,
          sellerId: userState?.uid,
          sellerName: currUser[0]?.name,
          shopName: currUser[0]?.shopName,
          shopAddress: currUser[0]?.shopAddress,
          shopPhoneNo: currUser[0]?.shopPhoneNo,
          brandImage: currUser[0]?.brandImage,
          colors: colors,
          sizes: sizes,
          productImg: URL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
          .then(() => {
            toast.success("Product successfully added")
            setProgress(0)
            setInputState({ ...productState })
            setSizes([])
            setColors([])
            setImage(null)
            setLoading(false)
          })
          .catch((err) => {
            console.log(err.message)
            setLoading(false)
          })
      }
    )
  }

  const updateProduct = async () => {
    setLoading(true)

    const newObjState = {
      ...editState,
      productImg: image ? image : editState.productImg,
    }
    const productRef = doc(db, "products", newObjState.productId)

    await updateDoc(productRef, {
      ...newObjState,
      updatedAt: serverTimestamp(),
    })
      .then(() => {
        toast.success("Product Updated")
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        console.log(err.message)
      })
  }

  const deleteProduct = async (row) => {
    setLoading(true)
    const { original } = row

    await deleteDoc(doc(db, "products", original.productId)).catch((err) => {
      console.log(err.message)
      setLoading(false)
    })
  }

  const showEditModal = (row) => {
    const { original } = row

    setEditModal(true)

    setEditState({ ...original })
  }

  const productsData = useMemo(() => [...products], [products])

  const productsColumn = useMemo(
    () =>
      products[0]
        ? Object.keys(products[0])
            .filter(
              (key) =>
                key !== "sellerId" &&
                key !== "colors" &&
                key !== "sizes" &&
                key !== "createdAt" &&
                key !== "productId"
            )
            .map((key) => {
              if (key === "productImg")
                return {
                  Header: "PRODUCT IMAGE",
                  accessor: key,
                  Cell: ({ value }) => (
                    <Image src={value} fit="contain" height={40} width={40} />
                  ),
                }

              if (key === "updatedAt") {
                return {
                  Header: "DATE",
                  accessor: key,
                }
              }

              if (key === "description") {
                return {
                  Header: key.toUpperCase(),
                  accessor: key,
                  Cell: ({ value }) => (!value ? "None" : value),
                }
              }

              return { Header: key.toUpperCase(), accessor: key }
            })
        : [],
    [products]
  )

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      ...columns,
      {
        id: "options",
        Header: "OPTIONS",
        Cell: ({ row }) => (
          <Group spacing={12} noWrap>
            <ActionIcon
              onClick={() => showEditModal(row)}
              color="baseColor"
              size="lg"
              variant="outline"
              radius={99}
            >
              <Edit size={24} />
            </ActionIcon>
            <ActionIcon
              onClick={() => deleteProduct(row)}
              color="red"
              size="lg"
              variant="outline"
              radius={99}
            >
              <Trash size={24} />
            </ActionIcon>
          </Group>
        ),
      },
    ])
  }

  const tableInstance = useTable(
    { columns: productsColumn, data: productsData },
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
    if (!userState) return navigate("/", { replace: true })
    setMounted(true)

    setPageSize(5)

    const q = query(collection(db, "products"), orderBy("updatedAt", "desc"))

    await onSnapshot(q, (querySnapshot) => {
      const temp = []

      querySnapshot.docs.map((doc) => {
        temp.push({
          ...doc.data(),
          productId: doc.id,
        })
      })

      setProducts(
        temp
          .filter((item) => item.sellerId === userState.uid)
          .map((item) => ({
            name: item.name,
            productImg: item.productImg,
            category: item.category,
            price: item.price,
            description: item.description,
            updatedAt: moment(item.updatedAt?.toDate()).format("MM/DD/YYYY"),
            productId: item.productId,
            sizes: item.sizes,
            colors: item.colors,
          }))
      )
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Get Current User
  useEffect(() => {
    const q = query(
      collection(db, "users_info"),
      where("uid", "==", userState.uid)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const temp = []
      snapshot.docs.map((doc) => temp.push({ ...doc.data(), userId: doc.id }))
      setCurrUser(temp)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  if (!mounted) return null

  return (
    <div className="relative flex flex-col w-full min-h-full p-4 mt-12 md:mt-0 gap-y-4 text-black/80">
      <Group
        className="sticky top-0 z-50 flex w-full bg-white rounded-lg"
        position="apart"
        align="center"
        p={20}
      >
        <Title order={2}>Products</Title>
        <UnstyledButton
          className="bg-[#4C52BE] shadow-sm active:scale-95 duration-100 shadow-black/30 rounded-full text-white px-2 h-8 w-max"
          onClick={() => setOpened(true)}
        >
          <Group position="apart" spacing={4} align="center">
            <Plus size={14} />
            <Text className="text-xs" weight={500}>
              ADD
            </Text>
          </Group>
        </UnstyledButton>
      </Group>

      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        setGlobalFilter={setGlobalFilter}
        globalFilter={state}
      />

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
          {!products ? (
            <Center className="h-max">
              <Stack spacing={2} align="center">
                <Image src="/empty_box.png" fit="contain" height={165} />
                <Text className="text-2xl" weight={700}>
                  Your List of Product is Empty
                </Text>
                <Text className="text-gray-600">
                  Start adding by clicking the add button.
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
                              className={`p-4 border-b font-extrabold truncate text-sm ${
                                i !== headerGroup.headers.length - 1 &&
                                "text-left"
                              }`}
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
                      </tr>
                    ))
                  }
                </thead>

                {/* Apply the table body props */}
                <tbody {...getTableBodyProps()}>
                  {
                    // Loop over the table rows
                    page.map((row) => {
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
                                  className={`p-4 truncate text-sm font-bold ${
                                    i === row.cells.length - 1 &&
                                    "flex justify-center items-center"
                                  }`}
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
              {state.pageIndex + 1} - {pageOptions.length} of {products.length}
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

      {/* Modal */}
      <Modal
        className="mantine-Modal-body"
        opened={opened}
        overlayOpacity={0.5}
        centered
        size="35rem"
        radius={20}
        title={<Title order={3}>Add Product</Title>}
        onClose={() => setOpened(false)}
      >
        <TextInput
          name="name"
          error={errors?.name}
          value={name}
          onChange={handleChange}
          variant="filled"
          label="Name"
          radius={24}
          size="md"
          placeholder="Name of product"
          rightSection={loading && <Loader size="sm" />}
          required
          icon={<MdProductionQuantityLimits size={18} />}
        />

        <Select
          value={category}
          data={categoryData}
          error={errors?.category}
          onChange={(val) => setInputState({ ...inputState, category: val })}
          variant="filled"
          label="Category"
          radius={24}
          size="md"
          placeholder="Type your category"
          rightSection={loading && <Loader size="sm" />}
          required
          icon={<MdProductionQuantityLimits size={18} />}
        />

        <NumberInput
          name="price"
          error={errors?.price}
          value={price}
          onChange={(val) => handlePriceValue(val)}
          variant="filled"
          label="Price"
          radius={24}
          size="md"
          min={0}
          parser={(value) => value.replace(/\P\s?|(,*)/g, "")}
          formatter={(value) =>
            !Number.isNaN(parseFloat(value))
              ? `P ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : "P "
          }
          stepHoldDelay={1000}
          stepHoldInterval={100}
          precision={2}
          required
          rightSection={loading && <Loader size="sm" />}
          icon={<MdOutlinePriceChange size={18} />}
          type="number"
        />

        <Textarea
          name="description"
          value={description}
          onChange={handleChange}
          label="Product Description"
          placeholder="Type here..."
          minRows={2}
          maxRows={4}
        />

        <Divider />

        {/* Sizes */}
        <Stack spacing={6}>
          <Group align="flex-end" position="apart" spacing={12}>
            <TextInput
              value={size}
              onChange={(e) => setSize(e.target.value)}
              variant="filled"
              label="Sizes"
              radius={24}
              size="md"
            />

            <ActionIcon
              className="ml-auto bg-[#e13838]"
              onClick={removeSize}
              size="lg"
              variant="filled"
              color="red"
              loading={loading}
              radius={99}
            >
              <Trash size={20} />
            </ActionIcon>
            <ActionIcon
              className="bg-[#4C52BE]"
              onClick={addSize}
              size="lg"
              variant="filled"
              color="baseColor"
              loading={loading}
              radius={99}
              disabled={!size || !size.trim()}
            >
              <Plus size={20} />
            </ActionIcon>
          </Group>
          <Group spacing={8} py={12}>
            {sizes.map((size, sIndx) => (
              <Badge key={sIndx} color="baseColor" size="sm" variant="outline">
                {size}
              </Badge>
            ))}
          </Group>
        </Stack>

        {/* Colors */}
        <Stack spacing={6}>
          <Group align="flex-end" position="apart" spacing={12}>
            <TextInput
              value={color}
              onChange={(e) => setColor(e.target.value)}
              variant="filled"
              label="Colors"
              radius={24}
              size="md"
            />

            <ActionIcon
              className="ml-auto bg-[#e13838]"
              onClick={deleteColor}
              size="lg"
              variant="filled"
              color="red"
              loading={loading}
              radius={99}
            >
              <Trash size={20} />
            </ActionIcon>
            <ActionIcon
              className="bg-[#4C52BE]"
              onClick={addColor}
              size="lg"
              variant="filled"
              color="baseColor"
              loading={loading}
              radius={99}
              disabled={!color || !color.trim()}
            >
              <Plus size={20} />
            </ActionIcon>
          </Group>
          <Group spacing={8} py={12}>
            {colors.map((color, cIndx) => (
              <Badge key={cIndx} color="baseColor" size="sm" variant="outline">
                {color}
              </Badge>
            ))}
          </Group>
        </Stack>

        <Group position="left" px="md" spacing={32}>
          <Tooltip
            withArrow
            label="Choose Image"
            radius={99}
            gutter={10}
            position="bottom"
            color="baseColor"
          >
            <ActionIcon
              variant="outline"
              component="label"
              htmlFor="imgbtn"
              radius="xl"
              size="xl"
              color="baseColor"
            >
              <Photo size={24} />
              <input
                hidden
                id="imgbtn"
                type="file"
                accept="image/*"
                onChange={handleImgChange}
              />
            </ActionIcon>
          </Tooltip>
          <Image
            radius={18}
            src={image ? URL.createObjectURL(image) : "/shop_logo.png"}
            fit="contain"
            width={285}
            placeholder
          />
          {progress > 0 && (
            <RingProgress
              sections={[{ value: progress, color: "#5B51BC" }]}
              roundCaps
              label={
                progress < 100 ? (
                  <Text align="center" size="lg">
                    {progress}%
                  </Text>
                ) : (
                  <Center>
                    <ThemeIcon radius="xl" size="xl" color="violet">
                      <Check size={20} />
                    </ThemeIcon>
                  </Center>
                )
              }
            />
          )}
        </Group>

        <Group position="right">
          <Button
            className="bg-[#4C52BE] text-base"
            onClick={saveProduct}
            radius={99}
            loading={loading}
          >
            Save
          </Button>
        </Group>
      </Modal>

      {/* Edit Modal */}
      <Modal
        className="mantine-Modal-body"
        opened={editModal}
        overlayOpacity={0.5}
        centered
        size="35rem"
        radius={20}
        title={<Title order={3}>Edit Product</Title>}
        onClose={() => {
          setImage(null)
          setEditState(null)
          setEditModal(false)
        }}
      >
        <TextInput
          name="name"
          value={editState?.name}
          onChange={handleChange}
          variant="filled"
          label="Name"
          radius={24}
          size="md"
          placeholder="Name of product"
          rightSection={loading && <Loader size="sm" />}
          required
          icon={<MdProductionQuantityLimits size={18} />}
        />

        <Select
          value={editState?.category}
          data={categoryData}
          onChange={(val) => setEditState({ ...editState, category: val })}
          variant="filled"
          label="Category"
          radius={24}
          size="md"
          placeholder="Type your category"
          rightSection={loading && <Loader size="sm" />}
          required
          icon={<MdProductionQuantityLimits size={18} />}
        />

        <NumberInput
          name="price"
          value={editState?.price}
          onChange={(val) => setEditState({ ...editState, price: val })}
          variant="filled"
          label="Price"
          radius={24}
          size="md"
          min={0}
          parser={(value) => value.replace(/\P\s?|(,*)/g, "")}
          formatter={(value) =>
            !Number.isNaN(parseFloat(value))
              ? `P ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : "P "
          }
          stepHoldDelay={1000}
          stepHoldInterval={100}
          required
          rightSection={loading && <Loader size="sm" />}
          icon={<MdOutlinePriceChange size={18} />}
          type="number"
        />

        <Textarea
          name="description"
          value={editState?.description}
          onChange={(e) =>
            setEditState({ ...editState, description: e.target.value })
          }
          label="Product Description"
          placeholder="Type here..."
          minRows={2}
          maxRows={4}
        />

        <Divider />

        {/* Sizes */}
        <Stack spacing={6}>
          <Group align="flex-end" position="apart" spacing={12}>
            <TextInput
              value={size}
              onChange={(e) => setSize(e.target.value)}
              variant="filled"
              label="Sizes"
              radius={24}
              size="md"
            />

            <ActionIcon
              className="ml-auto bg-[#e13838]"
              onClick={() => {
                const temp = [...editState?.sizes]
                temp.pop()
                setEditState({ ...editState, sizes: temp })
              }}
              size="lg"
              variant="filled"
              color="red"
              loading={loading}
              radius={99}
            >
              <Trash size={20} />
            </ActionIcon>
            <ActionIcon
              className="bg-[#4C52BE]"
              onClick={() => {
                setEditState({
                  ...editState,
                  sizes: [...editState?.sizes, size],
                })
                setSize("")
              }}
              size="lg"
              variant="filled"
              color="baseColor"
              loading={loading}
              radius={99}
              disabled={!size || !size.trim()}
            >
              <Plus size={20} />
            </ActionIcon>
          </Group>
          <Group spacing={8} py={12}>
            {editState?.sizes.map((size, sIndx) => (
              <Badge key={sIndx} color="baseColor" size="sm" variant="outline">
                {size}
              </Badge>
            ))}
          </Group>
        </Stack>

        {/* Colors */}
        <Stack spacing={6}>
          <Group align="flex-end" position="apart" spacing={12}>
            <TextInput
              value={color}
              onChange={(e) => setColor(e.target.value)}
              variant="filled"
              label="Colors"
              radius={24}
              size="md"
            />

            <ActionIcon
              className="ml-auto bg-[#e13838]"
              onClick={deleteColor}
              size="lg"
              variant="filled"
              color="red"
              loading={loading}
              radius={99}
            >
              <Trash size={20} />
            </ActionIcon>
            <ActionIcon
              className="bg-[#4C52BE]"
              onClick={addColor}
              size="lg"
              variant="filled"
              color="baseColor"
              loading={loading}
              radius={99}
              disabled={!color || !color.trim()}
            >
              <Plus size={20} />
            </ActionIcon>
          </Group>
          <Group spacing={8} py={12}>
            {editState?.colors.map((color, cIndx) => (
              <Badge key={cIndx} color="baseColor" size="sm" variant="outline">
                {color}
              </Badge>
            ))}
          </Group>
        </Stack>

        <Group position="left" px="md" spacing={32}>
          {/* Image File Button */}
          <Tooltip
            withArrow
            label="Choose Image"
            radius={99}
            gutter={10}
            position="bottom"
            color="baseColor"
          >
            <ActionIcon
              variant="outline"
              component="label"
              htmlFor="imgbtn"
              radius="xl"
              size="xl"
              color="baseColor"
            >
              <Photo size={24} />
              <input
                hidden
                id="imgbtn"
                type="file"
                accept="image/*"
                onChange={handleImgChange}
              />
            </ActionIcon>
          </Tooltip>
          <Image
            radius={18}
            src={image ? URL.createObjectURL(image) : editState?.productImg}
            fit="contain"
            width={285}
            placeholder
          />

          {/* Ring Progress */}
          {progress > 0 && (
            <RingProgress
              sections={[{ value: progress, color: "#5B51BC" }]}
              roundCaps
              label={
                progress < 100 ? (
                  <Text align="center" size="lg">
                    {progress}%
                  </Text>
                ) : (
                  <Center>
                    <ThemeIcon radius="xl" size="xl" all color="violet">
                      <Check size={20} />
                    </ThemeIcon>
                  </Center>
                )
              }
            />
          )}
        </Group>

        <Group position="right">
          <Button
            className="bg-[#4C52BE] text-base"
            onClick={updateProduct}
            radius={99}
            loading={loading}
          >
            Save Changes
          </Button>
        </Group>
      </Modal>
    </div>
  )
}

export default ProductList
