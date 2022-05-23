import "regenerator-runtime/runtime"
import { TextInput } from "@mantine/core"
import React, { useState } from "react"
import { useAsyncDebounce } from "react-table"

const GlobalFilter = ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) => {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = useState("")
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined)
  }, 300)

  return (
    <TextInput
      className="w-full sm:w-72"
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
        onChange(e.target.value)
      }}
      placeholder="Search"
      size="md"
      radius={99}
    />
  )
}

export default GlobalFilter
