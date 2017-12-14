<?php
//error_reporting(E_ALL);
//ini_set('display_errors',1);

function getAndIncrementId() {
    $filename = "next_val.data";
    $next_val_f = fopen($filename, "c+");
    if (flock($next_val_f, LOCK_EX)) {
        $next_val = (int)fread($next_val_f, filesize($filename));
        echo $next_val;
        $next_val += 1;
        ftruncate($next_val_f, 0);
        rewind($next_val_f);
        fwrite($next_val_f, "" . $next_val);
        fclose($next_val_f);
        flock($next_val_f, LOCK_UN);
        return $next_val - 1;
    }
    return -1;
}

$data = json_decode(file_get_contents('php://input'), true);

$ext = $data["ext"];
$blob = $data["blob"];
$name = "";

if (array_key_exists("name", $data)) {
    $name = $data["name"];
    array_map('unlink', glob("images/" . $name . ".*"));
    echo "trying to save " . $name;
} else {
    $name = getAndIncrementId();
    if ($name == -1) {
        echo "lock unaquired failure";
        exit();
    }
}

$myfile = fopen("images/" . $name . "." . $ext, "w");
$blob = file_get_contents($blob);
fwrite($myfile, $blob);
fclose($myfile);
?>
