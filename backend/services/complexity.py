def compute_complexity(tree: dict) -> dict:
    """
    Computes tree complexity metrics in a single O(N) pass.
    Returns nodes (total count), depth (max path length), leaves (terminal nodes).
    """
    def walk(node: dict) -> tuple[int, int, int]:
        if node["type"] == "leaf":
            return 1, 0, 1
        left_n, left_d, left_l = walk(node["left"])
        right_n, right_d, right_l = walk(node["right"])
        return (
            1 + left_n + right_n,
            1 + max(left_d, right_d),
            left_l + right_l,
        )

    nodes, depth, leaves = walk(tree)
    return {"nodes": nodes, "depth": depth, "leaves": leaves}
