<?php
$dirname = "images/";
$images = glob($dirname."*");
echo json_encode($images);
?>
