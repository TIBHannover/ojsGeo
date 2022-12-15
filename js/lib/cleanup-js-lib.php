<?php

/**
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * Download JavaScript dependencies for OJS plugin OPTIMETA Geo Plugin
 * 
 * Usage:
 * 
 * This script is run with composer update or composer install
 * 
 * @author Daniel Nüst (OPTIMETA)
 */

$cwd = getcwd() . '/js/lib'; // IMPORTANT!

# list of download URLs and files that need to be kept
$keep_files = [
    $cwd . '/daterangepicker/daterangepicker.css',
    $cwd . '/daterangepicker/daterangepicker.js',
    $cwd . '/leaflet/dist/leaflet.css',
    $cwd . '/leaflet/dist/leaflet.js',
    $cwd . '/leaflet/dist/leaflet.js.map',
    $cwd . '/leaflet/dist/images/marker-shadow.png',
    $cwd . '/leaflet/dist/images/marker-icon-2x.png',
    $cwd . '/leaflet/dist/images/marker-icon.png',
    $cwd . '/leaflet/dist/images/layers-2x.png',
    $cwd . '/leaflet/dist/images/layers.png',
    $cwd . '/leaflet-control-geocoder/dist/Control.Geocoder.css',
    $cwd . '/leaflet-control-geocoder/dist/Control.Geocoder.min.js',
    $cwd . '/leaflet-control-geocoder/dist/Control.Geocoder.min.js.map',
    $cwd . '/leaflet-draw/dist/leaflet.draw.css',
    $cwd . '/leaflet-draw/dist/leaflet.draw.js',
    $cwd . '/leaflet-draw/dist/images/layers-2x.png',
    $cwd . '/leaflet-draw/dist/images/marker-icon-2x.png',
    $cwd . '/leaflet-draw/dist/images/marker-shadow.png',
    $cwd . '/leaflet-draw/dist/images/spritesheet.png',
    $cwd . '/leaflet-draw/dist/images/layers.png',
    $cwd . '/leaflet-draw/dist/images/marker-icon.png',
    $cwd . '/leaflet-draw/dist/images/spritesheet-2x.png',
    $cwd . '/leaflet-draw/dist/images/spritesheet.svg',
    $cwd . '/moment/moment.js',
    $cwd . '/leaflet-color-markers/img/marker-icon-2x-red.png',
    $cwd . '/leaflet-color-markers/img/marker-icon-2x-blue.png',
    $cwd . '/leaflet-color-markers/img/marker-shadow.png',
];

echo "Keeping files in {$cwd}:\n";
print_r($keep_files);

// https://github.com/rodurma/PHP-Functions/blob/master/glob_recursive.php
function glob_recursive($pattern, $flags = 0)
{
    $files = glob($pattern, $flags);

    foreach (glob(dirname($pattern) . '/*', GLOB_ONLYDIR | GLOB_NOSORT) as $dir) {
        $files = array_merge($files, glob_recursive($dir . '/' . basename($pattern), $flags));
    }

    return $files;
}

// https://stackoverflow.com/a/15111679/261210
function rmdir_recursive($dirPath)
{
    if (!empty($dirPath) && is_dir($dirPath)) {
        $dirObj = new RecursiveDirectoryIterator($dirPath, RecursiveDirectoryIterator::SKIP_DOTS); //upper dirs not included,otherwise DISASTER HAPPENS :)
        $files = new RecursiveIteratorIterator($dirObj, RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($files as $path)
            $path->isDir() && !$path->isLink() ? rmdir($path->getPathname()) : unlink($path->getPathname());
        rmdir($dirPath);
        return true;
    }
    return false;
}

// https://stackoverflow.com/a/1833681/261210
function RemoveEmptySubFolders($path)
{
    $empty = true;
    foreach (glob($path . DIRECTORY_SEPARATOR . "*") as $file) {
        $empty &= is_dir($file) && RemoveEmptySubFolders($file);
    }
    return $empty && rmdir($path);
}

$filenames = array_merge(glob_recursive($cwd . '/**/*'), glob($cwd . '/**/{.[!.],}*', GLOB_BRACE));
$to_remove = array_diff($filenames, $keep_files);

foreach ($to_remove as $f) {
    unlink($f);
}

// somehow not caught by regexes above
rmdir_recursive($cwd . '/leaflet-control-geocoder/.github');
rmdir_recursive($cwd . '/leaflet-control-geocoder/node_modules');
rmdir_recursive($cwd . '/leaflet/.github');
rmdir_recursive($cwd . '/leaflet/spec');

// transitive dependency - already included in OJS
rmdir_recursive($cwd . '/jquery');

// final cleanup
RemoveEmptySubFolders($cwd);

echo "Done {$cwd}\n";
