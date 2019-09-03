<?php
//var_dump($_POST); // Element 'bar' is string(1) "b"
$param = json_decode($_REQUEST["param"], true);

$serverUrl = $param['url'];
$photoUrl = $param['photo'];

//die($result);

/*$img_real_path = realpath(dirname(__FILE__)."".$_POST['img']);
$curl_file = curl_file_create($img_real_path,'image/jpeg','maxresdefault.jpg');
$ch=curl_init();
curl_setopt_array($ch, array(
CURLOPT_RETURNTRANSFER => 1,
CURLOPT_URL => $param->a,
CURLOPT_POST => 1,
CURLOPT_POSTFIELDS => array("photo" => $curl_file)
));
$img_attach = json_decode(curl_exec($ch), true);*/

//$image_path = dirname(__FILE__).'\maxresdefault.jpg';

//$image_path = 'C:\WebServer\OSPanel\userdata\temp\FOO6BAA.jpg';
//echo($image_path);

$link_local = tempnam(sys_get_temp_dir(), 'FOO');
rename($link_local, $link_local .= '.jpg');
file_put_contents($link_local,file_get_contents($photoUrl));

//$image_path = './images/tempPhoto.jpg';
//file_put_contents($image_path, file_get_contents($photoUrl));

//echo($image_path);
$photo_data = array('file1'=> '@'.$link_local);

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $serverUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_POSTFIELDS,  $photo_data);
$response = curl_exec($ch);
curl_close($ch);
$responseJson = json_decode($response, true);
echo($response);

?>