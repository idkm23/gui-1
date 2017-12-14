<?php
$data = json_decode(file_get_contents('php://input'), true);

$id = $data["id"];

array_map('unlink', glob("images/" . $id . ".*"));
?>
