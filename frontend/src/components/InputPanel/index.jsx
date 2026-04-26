import ExpressionInput from "./ExpressionInput"
import VariableControls from "./VariableControls"

export default function InputPanel() {
  return (
    <div className="space-y-3">
      <ExpressionInput />
      <VariableControls />
    </div>
  )
}
